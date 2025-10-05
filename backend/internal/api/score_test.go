package api

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestScoreHandler_SaveScore_InvalidInput(t *testing.T) {
	handler := NewScoreHandler()
	router := gin.Default()
	router.POST("/scores", func(c *gin.Context) {
		c.Set("userID", uuid.New())
		handler.SaveScore(c)
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/scores", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestScoreHandler_SaveScore_Unauthorized(t *testing.T) {
	handler := NewScoreHandler()
	router := gin.Default()
	router.POST("/scores", handler.SaveScore)

	t.Run("Unauthorized without user context", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/scores", bytes.NewBufferString("{}"))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestScoreHandler_GetMyScores_Unauthorized(t *testing.T) {
	handler := NewScoreHandler()
	router := gin.Default()
	router.GET("/my-scores", handler.GetMyScores)

	t.Run("Unauthorized without user context", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/my-scores", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestScoreHandler_GetBestScore(t *testing.T) {
	handler := NewScoreHandler()
	
	t.Run("Unauthorized without user context", func(t *testing.T) {
		router := gin.Default()
		router.GET("/best-score", handler.GetBestScore)
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/best-score?timeMode=60", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Missing timeMode parameter", func(t *testing.T) {
		router := gin.Default()
		router.GET("/best-score", func(c *gin.Context) {
			c.Set("userID", uuid.New())
			handler.GetBestScore(c)
		})
		
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/best-score", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
