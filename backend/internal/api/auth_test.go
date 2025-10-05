package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestAuthHandler_GetMe(t *testing.T) {
	handler := NewAuthHandler()
	router := gin.Default()
	router.GET("/me", handler.GetMe)

	t.Run("Success with user context", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/me", nil)
		
		// Create a new router with middleware to set user context
		router := gin.Default()
		router.GET("/me", func(c *gin.Context) {
			c.Set("userID", uint(1))
			c.Set("username", "testuser")
			handler.GetMe(c)
		})
		
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "testuser", response["username"])
	})

	t.Run("Unauthorized without user context", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/me", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestAuthHandler_Register_InvalidInput(t *testing.T) {
	handler := NewAuthHandler()
	router := gin.Default()
	router.POST("/register", handler.Register)

	t.Run("Invalid JSON", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/register", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAuthHandler_Login_InvalidInput(t *testing.T) {
	handler := NewAuthHandler()
	router := gin.Default()
	router.POST("/login", handler.Login)

	t.Run("Invalid JSON", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/login", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
