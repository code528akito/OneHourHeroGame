package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null;size:50" json:"username"`
	PasswordHash string    `gorm:"not null;size:255" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Profile       *PlayerProfile     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"profile,omitempty"`
	Scores        []Score            `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"scores,omitempty"`
	Achievements  []UserAchievement  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"achievements,omitempty"`
	Settings      *UserSettings      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"settings,omitempty"`
}

type PlayerProfile struct {
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	UserID                uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	UnlockedClasses       pq.StringArray `gorm:"type:text[];default:'{KNIGHT}'" json:"unlocked_classes"`
	TotalPlayTime         int            `gorm:"default:0" json:"total_play_time"`
	TotalGamesPlayed      int            `gorm:"default:0" json:"total_games_played"`
	TotalMonstersDefeated int            `gorm:"default:0" json:"total_monsters_defeated"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
}

type Score struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null;index:idx_user_scores" json:"user_id"`
	TimeMode         string    `gorm:"not null;size:20;index:idx_leaderboard" json:"time_mode"`
	Score            int       `gorm:"not null;index:idx_user_scores,idx_leaderboard" json:"score"`
	Rank             string    `gorm:"not null;size:1" json:"rank"`
	RemainingTime    int       `gorm:"not null" json:"remaining_time"`
	PlayerLevel      int       `gorm:"not null" json:"player_level"`
	ItemsCollected   int       `gorm:"not null" json:"items_collected"`
	MonstersDefeated int       `gorm:"not null" json:"monsters_defeated"`
	Cleared          bool      `gorm:"not null" json:"cleared"`
	CreatedAt        time.Time `gorm:"index:idx_leaderboard" json:"created_at"`

	User *User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

type Achievement struct {
	ID          string `gorm:"primary_key;size:50" json:"id"`
	Name        string `gorm:"not null;size:100" json:"name"`
	Description string `gorm:"not null;type:text" json:"description"`
	RewardType  string `gorm:"not null;size:20" json:"reward_type"`
	RewardValue string `gorm:"size:50" json:"reward_value"`

	Users []UserAchievement `gorm:"foreignKey:AchievementID" json:"users,omitempty"`
}

type UserAchievement struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_achievement" json:"user_id"`
	AchievementID string    `gorm:"not null;size:50;uniqueIndex:idx_user_achievement" json:"achievement_id"`
	UnlockedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"unlocked_at"`

	User        *User        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Achievement *Achievement `gorm:"foreignKey:AchievementID" json:"achievement,omitempty"`
}

type UserSettings struct {
	UserID      uuid.UUID `gorm:"type:uuid;primary_key" json:"user_id"`
	SoundVolume float32   `gorm:"default:1.0" json:"sound_volume"`
	MusicVolume float32   `gorm:"default:1.0" json:"music_volume"`
	UpdatedAt   time.Time `json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}
