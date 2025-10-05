package service

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/akito/one-hour-hero/backend/internal/database"
	"github.com/akito/one-hour-hero/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string    `json:"token"`
	User  UserInfo  `json:"user"`
}

type UserInfo struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}

type Claims struct {
	UserID   uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
	jwt.RegisteredClaims
}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
	var existingUser models.User
	result := database.DB.Where("username = ?", req.Username).First(&existingUser)
	if result.Error == nil {
		return nil, errors.New("ユーザー名は既に使用されています")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("パスワードのハッシュ化に失敗しました: %w", err)
	}

	user := models.User{
		Username:     req.Username,
		PasswordHash: string(passwordHash),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("ユーザーの作成に失敗しました: %w", err)
	}

	profile := models.PlayerProfile{
		UserID:          user.ID,
		UnlockedClasses: []string{"KNIGHT"},
	}
	if err := database.DB.Create(&profile).Error; err != nil {
		return nil, fmt.Errorf("プロフィールの作成に失敗しました: %w", err)
	}

	settings := models.UserSettings{
		UserID:      user.ID,
		SoundVolume: 1.0,
		MusicVolume: 1.0,
	}
	if err := database.DB.Create(&settings).Error; err != nil {
		return nil, fmt.Errorf("設定の作成に失敗しました: %w", err)
	}

	token, err := s.generateToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User: UserInfo{
			ID:       user.ID,
			Username: user.Username,
		},
	}, nil
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	var user models.User
	result := database.DB.Where("username = ?", req.Username).First(&user)
	if result.Error != nil {
		return nil, errors.New("ユーザー名またはパスワードが正しくありません")
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, errors.New("ユーザー名またはパスワードが正しくありません")
	}

	token, err := s.generateToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User: UserInfo{
			ID:       user.ID,
			Username: user.Username,
		},
	}, nil
}

func (s *AuthService) generateToken(userID uuid.UUID, username string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}

	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("トークンの生成に失敗しました: %w", err)
	}

	return tokenString, nil
}
