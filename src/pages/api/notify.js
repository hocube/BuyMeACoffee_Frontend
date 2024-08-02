export default async function handler(req, res) {
    if (req.method == "POST"){
        const {notifyMsg} = req.body;

        // 디스코드 Webhook URL
        const webhookURL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
        console.log("Discord Webhook URL:", webhookURL);

        if (!webhookURL) {
            res.status(500).json({success : false, error : "Webhook URL not set"});
            return;
        }

        // Fetch API를 사용하여 디스코드 웹훅에 POST 요청
        const response = await fetch(webhookURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: notifyMsg,
            }),
          });
      
          if (response.ok) {
            res.status(200).json({ success: true });
          } else {
            res
              .status(500)
              .json({ success: false, error: "Failed to send message to Discord" });
          }
        } else {
          res.status(405).json({ message: "Only POST requests are allowed" });
        }
      }
 