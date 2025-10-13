package services

import (
	"os"

	"github.com/line/line-bot-sdk-go/linebot"
)

var Bot *linebot.Client

func InitLineBot() error {
	var err error
	lineChannelSecret := os.Getenv("LINE_CHANNEL_SECRET")
	lineChannelAccessToken := os.Getenv("LINE_CHANNEL_ACCESS_TOKEN")
	Bot, err = linebot.New(
		lineChannelSecret,
		lineChannelAccessToken,
	)
	if err != nil {
		return err
	}
	return nil
}
func PushMessage(userID, message string) error {
	_, err := Bot.PushMessage(userID, linebot.NewTextMessage(message)).Do()
	return err
}
