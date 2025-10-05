package service

import (
	"fmt"
	"time"

	"github.com/akito/one-hour-hero/backend/internal/database"
	"github.com/akito/one-hour-hero/backend/internal/models"
	"github.com/google/uuid"
)

type ScoreService struct{}

type SaveScoreRequest struct {
	TimeMode         string `json:"time_mode" binding:"required"`
	Score            int    `json:"score" binding:"required,min=0"`
	Rank             string `json:"rank" binding:"required"`
	RemainingTime    int    `json:"remaining_time" binding:"min=0"`
	PlayerLevel      int    `json:"player_level" binding:"required,min=1"`
	ItemsCollected   int    `json:"items_collected" binding:"min=0"`
	MonstersDefeated int    `json:"monsters_defeated" binding:"min=0"`
	Cleared          bool   `json:"cleared"`
}

func NewScoreService() *ScoreService {
	return &ScoreService{}
}

func (s *ScoreService) SaveScore(userID uuid.UUID, req *SaveScoreRequest) (*models.Score, error) {
	// 重複保存チェック：同じユーザーが10秒以内に同じスコアを保存しようとした場合は拒否
	var recentScore models.Score
	err := database.DB.Where("user_id = ? AND time_mode = ? AND score = ? AND created_at > ?",
		userID, req.TimeMode, req.Score, time.Now().Add(-10*time.Second)).
		First(&recentScore).Error
	
	if err == nil {
		// 重複スコアが見つかった
		return nil, fmt.Errorf("同じスコアを短時間に複数回保存することはできません（10秒間隔を空けてください）")
	}

	score := models.Score{
		UserID:           userID,
		TimeMode:         req.TimeMode,
		Score:            req.Score,
		Rank:             req.Rank,
		RemainingTime:    req.RemainingTime,
		PlayerLevel:      req.PlayerLevel,
		ItemsCollected:   req.ItemsCollected,
		MonstersDefeated: req.MonstersDefeated,
		Cleared:          req.Cleared,
	}

	if err := database.DB.Create(&score).Error; err != nil {
		return nil, fmt.Errorf("スコアの保存に失敗しました: %w", err)
	}

	return &score, nil
}

func (s *ScoreService) GetMyScores(userID uuid.UUID, timeMode string) ([]models.Score, error) {
	var scores []models.Score
	query := database.DB.Where("user_id = ?", userID)
	
	if timeMode != "" {
		query = query.Where("time_mode = ?", timeMode)
	}
	
	if err := query.Order("score DESC").Limit(10).Find(&scores).Error; err != nil {
		return nil, fmt.Errorf("スコアの取得に失敗しました: %w", err)
	}

	return scores, nil
}

func (s *ScoreService) GetBestScore(userID uuid.UUID, timeMode string) (*models.Score, error) {
	var score models.Score
	result := database.DB.Where("user_id = ? AND time_mode = ?", userID, timeMode).
		Order("score DESC").
		First(&score)

	if result.Error != nil {
		return nil, fmt.Errorf("ベストスコアが見つかりません: %w", result.Error)
	}

	return &score, nil
}

func (s *ScoreService) GetLeaderboard(timeMode string, limit int) ([]models.Score, error) {
	var scores []models.Score
	query := database.DB.Preload("User")

	if timeMode != "" {
		query = query.Where("time_mode = ?", timeMode)
	}

	if limit <= 0 || limit > 100 {
		limit = 10
	}

	if err := query.Order("score DESC").Limit(limit).Find(&scores).Error; err != nil {
		return nil, fmt.Errorf("リーダーボードの取得に失敗しました: %w", err)
	}

	return scores, nil
}
