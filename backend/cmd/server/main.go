package main

import (
	"log"
	"os"

	"github.com/akito/one-hour-hero/backend/internal/api"
	"github.com/akito/one-hour-hero/backend/internal/database"
	"github.com/akito/one-hour-hero/backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "migrate":
			runMigrations()
			return
		case "seed":
			runSeed()
			return
		}
	}

	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	router := setupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	authHandler := api.NewAuthHandler()
	playerHandler := api.NewPlayerHandler()
	scoreHandler := api.NewScoreHandler()
	achievementHandler := api.NewAchievementHandler()

	apiGroup := router.Group("/api")
	{
		auth := apiGroup.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(), authHandler.GetMe)
		}

		player := apiGroup.Group("/player", middleware.AuthMiddleware())
		{
			player.GET("/profile", playerHandler.GetProfile)
			player.PUT("/profile", playerHandler.UpdateProfile)
			player.GET("/settings", playerHandler.GetSettings)
			player.PUT("/settings", playerHandler.UpdateSettings)
		}

		scores := apiGroup.Group("/scores")
		{
			scores.POST("", middleware.AuthMiddleware(), scoreHandler.SaveScore)
			scores.GET("/my", middleware.AuthMiddleware(), scoreHandler.GetMyScores)
			scores.GET("/best", middleware.AuthMiddleware(), scoreHandler.GetBestScore)
			scores.GET("/leaderboard", scoreHandler.GetLeaderboard)
		}

		achievements := apiGroup.Group("/achievements")
		{
			achievements.GET("", achievementHandler.GetAllAchievements)
			achievements.GET("/my", middleware.AuthMiddleware(), achievementHandler.GetMyAchievements)
			achievements.POST("/unlock", middleware.AuthMiddleware(), achievementHandler.UnlockAchievement)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return router
}

func runMigrations() {
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Migrations completed successfully")
}

func runSeed() {
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	log.Println("Seeding completed successfully")
}
