export default async function handler(req, res) {
    console.log("Handler 시작");
    
    if (req.method == "POST"){
        const {notifyMsg} = req.body;

        // 디스코드 Webhook URL
        const webhookURL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
        console.log("Discord Webhook URL:", webhookURL);

        if (!webhookURL) {
            console.log("Webhook URL이 설정되지 않았습니다."); 
            res.status(500).json({success : false, error : "Webhook URL not set"});
            return;
        }

        try {
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
              console.log("디스코드로 메시지 전송 성공"); // 로그 추가
              res.status(200).json({ success: true });
            } else {
              const errorText = await response.text();
              console.log("디스코드로 메시지 전송 실패:", errorText); // 로그 추가
              res.status(500).json({ success: false, error: "Failed to send message to Discord", details: errorText });
            }
          } catch (error) {
            console.log("디스코드로 메시지 전송 중 오류 발생:", error.message); // 로그 추가
            res.status(500).json({ success: false, error: "Error sending message to Discord", details: error.message });
          }
        } else {
          console.log("잘못된 요청 방법:", req.method); // 로그 추가
          res.status(405).json({ message: "Only POST requests are allowed" });
        }
      }