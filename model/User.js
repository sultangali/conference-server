import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String,  required: true },
    login: { type: String },
    hashedPassword: { type: String, required: true },
    correspondent: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User"
    },
    lastname: String,
    firstname: String,
    fathername: String,
    phone: String,
    organization: String,
    position: String,
    rank: String,
    degree: String,
    checked: {type: Boolean, default: false},
    participation_type: { type: String, enum: ["problem", "solve"] },
    participation_form: { type: String, enum: ["online", "offline", "mixed"] },
    avatar: String,
    isAdmin: Boolean,
    status: { type: String, enum: ["accepted", "denied"], default: "denied" },
    role: {type: String, enum: ["correspondent", "coauthor", "moderator"], default: "correspondent"},
    isVerified: { type: Boolean, default: false },  // ✅ Верификация
    verificationToken: { type: String }, // ✅ Токен для подтверждения
    coauthors: [
      {
        email: String, // Соавтор НЕ регистрируется сам, но имеет email
        lastname: String,
        firstname: String,
        fathername: String,
        organization: String,
        position: String,
        rank: String,
        degree: String,
        participation_form: { type: String, enum: ["online", "offline", "mixed"] },
        login: String,  // Генерируется автоматически
        password: String, // Пароль тоже
      }
    ],
    correspondent_data: {
      lastname: String,
      firstname: String,
      email: String
    },
    isNotified: {
      problemBase: Date,  // Оповещение о базе проблем
      solveRegEnd: Date,  // Конец регистрации (Solve)
      beforeArrival: Date, // Перед заездом
      conferenceStart: Date, // Открытие конференции
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema)