import cron from "node-cron";
import User from "../model/User.js";
import { sendEmail } from "../service/mailSend.js";
import moment from "moment";

// 📌 Важные даты и ключи для isNotified
const importantDates = [
  { date: "2025-03-15", event: "Оповещение о базе проблем", type: "solve", key: "problemBase" },
  { date: "2025-06-01", event: "Оповещение о конце регистрации (Solve)", type: "solve", key: "solveRegEnd" },
  { date: "2025-02-21", event: "Оповещение перед заездом", type: "all", key: "beforeArrival" },
  { date: "2025-06-18", event: "Открытие конференции", type: "all", key: "conferenceStart" },
];

// 📌 Функция отправки писем (раз в нужную дату)
const checkAndSendEmails = async () => {
  const today = moment().startOf("day").toDate(); // Текущая дата без времени

  for (const event of importantDates) {
    if (moment(today).isSame(moment(event.date, "YYYY-MM-DD"), "day")) {
      console.log(`📩 Начинаем рассылку: ${event.event}`);

      let users = [];
      if (event.type === "solve") {
        users = await User.find({
          participation_type: "solve",
          isVerified: true,
          $or: [
            { [`isNotified.${event.key}`]: { $exists: false } },
            { [`isNotified.${event.key}`]: null }
          ]
        });
      } else {
        users = await User.find({
          isVerified: true,
          $or: [
            { [`isNotified.${event.key}`]: { $exists: false } },
            { [`isNotified.${event.key}`]: null }
          ]
        });
      }

      for (const user of users) {
        let emailContent = `<h2>Оповещение: ${event.event}</h2><p>Здравствуйте, ${user.firstname} ${user.lastname}!</p>`;

        if (event.type === "solve" && event.event === "Оповещение о базе проблем") {
          emailContent += `<p>Скоро откроется база задач для решения. Следите за обновлениями!</p>`;
        }

        if (event.event === "Оповещение перед заездом") {
          emailContent += `
            <p>Конференция начинается совсем скоро. Пожалуйста, подтвердите, изменится ли ваша форма участия.</p>
            <a href="http://localhost:5000/api/user/update-participation/${user._id}?type=online" style="background: green; color: white; padding: 10px; text-decoration: none;">Переключиться на Онлайн</a>
            <a href="http://localhost:5000/api/user/update-participation/${user._id}?type=offline" style="background: blue; color: white; padding: 10px; text-decoration: none;">Переключиться на Офлайн</a>
            <a href="http://localhost:5000/api/user/update-participation/${user._id}?type=mixed" style="background: orange; color: white; padding: 10px; text-decoration: none;">Переключиться на Смешанный</a>
            </br>
            `;
        }

        // Отправляем письмо
        await sendEmail(user.email, `Оповещение: ${event.event}`, emailContent);

        // Обновляем пользователя: записываем дату отправки письма
        await User.updateOne({ _id: user._id }, { [`isNotified.${event.key}`]: today });

        console.log(`✅ Письмо отправлено: ${user.email} (событие: ${event.event})`);
      }
    }
  }
};

// 📌 Запускаем CRON-задачу (ежедневно в 08:00 утра)
cron.schedule("* * * * *", async () => {
  console.log("🔄 Запущена проверка на отправку напоминаний...");
  await checkAndSendEmails();
});
