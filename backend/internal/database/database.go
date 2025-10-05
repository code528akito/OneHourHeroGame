package database

import (
	"fmt"
	"log"
	"os"

	"github.com/akito/one-hour-hero/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=one_hour_hero port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func Migrate() error {
	log.Println("Running database migrations...")
	
	err := DB.AutoMigrate(
		&models.User{},
		&models.PlayerProfile{},
		&models.Score{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.UserSettings{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

func Seed() error {
	log.Println("Seeding database...")

	achievements := []models.Achievement{
		{
			ID:          "first_clear",
			Name:        "初めての勝利",
			Description: "いずれかのモードで初めてクリア",
			RewardType:  "CLASS_UNLOCK",
			RewardValue: "MAGE",
		},
		{
			ID:          "speed_runner",
			Name:        "スピードランナー",
			Description: "60分モードを30分以内にクリア",
			RewardType:  "TITLE",
			RewardValue: "時の支配者",
		},
		{
			ID:          "all_s_rank",
			Name:        "完全制覇",
			Description: "全時間モードでSランク達成",
			RewardType:  "TITLE",
			RewardValue: "真の勇者",
		},
		{
			ID:          "monster_hunter",
			Name:        "モンスターハンター",
			Description: "累計100体のモンスターを倒す",
			RewardType:  "TITLE",
			RewardValue: "狩人",
		},
		{
			ID:          "item_collector",
			Name:        "コレクター",
			Description: "全てのアイテムを収集",
			RewardType:  "HIDDEN_CONTENT",
			RewardValue: "secret_dungeon",
		},
		{
			ID:          "second_clear",
			Name:        "二つ目のクラス",
			Description: "2回目のクリア",
			RewardType:  "CLASS_UNLOCK",
			RewardValue: "THIEF",
		},
	}

	for _, achievement := range achievements {
		var existing models.Achievement
		result := DB.Where("id = ?", achievement.ID).First(&existing)
		if result.Error == nil {
			continue
		}
		if err := DB.Create(&achievement).Error; err != nil {
			return fmt.Errorf("failed to seed achievement %s: %w", achievement.ID, err)
		}
	}

	log.Println("Database seeding completed")
	return nil
}
