package service

import (
	"fmt"

	"github.com/akito/one-hour-hero/backend/internal/database"
	"github.com/akito/one-hour-hero/backend/internal/models"
	"github.com/google/uuid"
)

type PlayerService struct{}

type UpdateProfileRequest struct {
	TotalPlayTime         *int `json:"total_play_time"`
	TotalGamesPlayed      *int `json:"total_games_played"`
	TotalMonstersDefeated *int `json:"total_monsters_defeated"`
}

func NewPlayerService() *PlayerService {
	return &PlayerService{}
}

func (s *PlayerService) GetProfile(userID uuid.UUID) (*models.PlayerProfile, error) {
	var profile models.PlayerProfile
	result := database.DB.Where("user_id = ?", userID).First(&profile)
	if result.Error != nil {
		return nil, fmt.Errorf("プロフィールが見つかりません: %w", result.Error)
	}
	return &profile, nil
}

func (s *PlayerService) UpdateProfile(userID uuid.UUID, req *UpdateProfileRequest) (*models.PlayerProfile, error) {
	var profile models.PlayerProfile
	result := database.DB.Where("user_id = ?", userID).First(&profile)
	if result.Error != nil {
		return nil, fmt.Errorf("プロフィールが見つかりません: %w", result.Error)
	}

	if req.TotalPlayTime != nil {
		profile.TotalPlayTime = *req.TotalPlayTime
	}
	if req.TotalGamesPlayed != nil {
		profile.TotalGamesPlayed = *req.TotalGamesPlayed
	}
	if req.TotalMonstersDefeated != nil {
		profile.TotalMonstersDefeated = *req.TotalMonstersDefeated
	}

	if err := database.DB.Save(&profile).Error; err != nil {
		return nil, fmt.Errorf("プロフィールの更新に失敗しました: %w", err)
	}

	return &profile, nil
}

func (s *PlayerService) GetSettings(userID uuid.UUID) (*models.UserSettings, error) {
	var settings models.UserSettings
	result := database.DB.Where("user_id = ?", userID).First(&settings)
	if result.Error != nil {
		settings = models.UserSettings{
			UserID:      userID,
			SoundVolume: 1.0,
			MusicVolume: 1.0,
		}
		if err := database.DB.Create(&settings).Error; err != nil {
			return nil, fmt.Errorf("設定の作成に失敗しました: %w", err)
		}
	}
	return &settings, nil
}

func (s *PlayerService) UpdateSettings(userID uuid.UUID, soundVolume, musicVolume float32) (*models.UserSettings, error) {
	var settings models.UserSettings
	result := database.DB.Where("user_id = ?", userID).First(&settings)
	if result.Error != nil {
		settings = models.UserSettings{UserID: userID}
	}

	settings.SoundVolume = soundVolume
	settings.MusicVolume = musicVolume

	if err := database.DB.Save(&settings).Error; err != nil {
		return nil, fmt.Errorf("設定の更新に失敗しました: %w", err)
	}

	return &settings, nil
}
