package service

import (
	"fmt"

	"github.com/akito/one-hour-hero/backend/internal/database"
	"github.com/akito/one-hour-hero/backend/internal/models"
	"github.com/google/uuid"
)

type AchievementService struct{}

type UnlockAchievementRequest struct {
	AchievementID string `json:"achievement_id" binding:"required"`
}

func NewAchievementService() *AchievementService {
	return &AchievementService{}
}

func (s *AchievementService) GetAllAchievements() ([]models.Achievement, error) {
	var achievements []models.Achievement
	if err := database.DB.Find(&achievements).Error; err != nil {
		return nil, fmt.Errorf("実績の取得に失敗しました: %w", err)
	}
	return achievements, nil
}

func (s *AchievementService) GetMyAchievements(userID uuid.UUID) ([]models.UserAchievement, error) {
	var userAchievements []models.UserAchievement
	if err := database.DB.Preload("Achievement").
		Where("user_id = ?", userID).
		Find(&userAchievements).Error; err != nil {
		return nil, fmt.Errorf("ユーザー実績の取得に失敗しました: %w", err)
	}
	return userAchievements, nil
}

func (s *AchievementService) UnlockAchievement(userID uuid.UUID, achievementID string) (*models.UserAchievement, error) {
	var existing models.UserAchievement
	result := database.DB.Where("user_id = ? AND achievement_id = ?", userID, achievementID).First(&existing)
	if result.Error == nil {
		return &existing, nil
	}

	var achievement models.Achievement
	if err := database.DB.Where("id = ?", achievementID).First(&achievement).Error; err != nil {
		return nil, fmt.Errorf("実績が見つかりません: %w", err)
	}

	userAchievement := models.UserAchievement{
		UserID:        userID,
		AchievementID: achievementID,
	}

	if err := database.DB.Create(&userAchievement).Error; err != nil {
		return nil, fmt.Errorf("実績の解放に失敗しました: %w", err)
	}

	if achievement.RewardType == "CLASS_UNLOCK" {
		var profile models.PlayerProfile
		if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err == nil {
			profile.UnlockedClasses = append(profile.UnlockedClasses, achievement.RewardValue)
			database.DB.Save(&profile)
		}
	}

	if err := database.DB.Preload("Achievement").First(&userAchievement, userAchievement.ID).Error; err != nil {
		return nil, err
	}

	return &userAchievement, nil
}
