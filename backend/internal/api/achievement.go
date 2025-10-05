package api

import (
	"net/http"

	"github.com/akito/one-hour-hero/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AchievementHandler struct {
	achievementService *service.AchievementService
}

func NewAchievementHandler() *AchievementHandler {
	return &AchievementHandler{
		achievementService: service.NewAchievementService(),
	}
}

func (h *AchievementHandler) GetAllAchievements(c *gin.Context) {
	achievements, err := h.achievementService.GetAllAchievements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, achievements)
}

func (h *AchievementHandler) GetMyAchievements(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	achievements, err := h.achievementService.GetMyAchievements(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, achievements)
}

func (h *AchievementHandler) UnlockAchievement(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	var req service.UnlockAchievementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効な入力です"})
		return
	}

	achievement, err := h.achievementService.UnlockAchievement(userID.(uuid.UUID), req.AchievementID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, achievement)
}
