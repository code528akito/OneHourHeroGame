package api

import (
	"net/http"
	"strconv"

	"github.com/akito/one-hour-hero/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ScoreHandler struct {
	scoreService *service.ScoreService
}

func NewScoreHandler() *ScoreHandler {
	return &ScoreHandler{
		scoreService: service.NewScoreService(),
	}
}

func (h *ScoreHandler) SaveScore(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	var req service.SaveScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// バリデーションエラーの詳細をログに出力
		c.Error(err)
		// より詳細なエラーメッセージを返す
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "無効な入力です",
			"details": err.Error(),
		})
		return
	}

	// リクエストデータをログ出力（デバッグ用）
	// c.Error()を使うことでGinのログミドルウェアに記録される
	c.Set("scoreRequest", req)

	score, err := h.scoreService.SaveScore(userID.(uuid.UUID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, score)
}

func (h *ScoreHandler) GetMyScores(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	timeMode := c.Query("timeMode")

	scores, err := h.scoreService.GetMyScores(userID.(uuid.UUID), timeMode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, scores)
}

func (h *ScoreHandler) GetBestScore(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	timeMode := c.Query("timeMode")
	if timeMode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "timeModeは必須です"})
		return
	}

	score, err := h.scoreService.GetBestScore(userID.(uuid.UUID), timeMode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, score)
}

func (h *ScoreHandler) GetLeaderboard(c *gin.Context) {
	timeMode := c.Query("timeMode")
	limitStr := c.DefaultQuery("limit", "10")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	scores, err := h.scoreService.GetLeaderboard(timeMode, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, scores)
}
