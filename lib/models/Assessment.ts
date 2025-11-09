import mongoose from "mongoose"

const AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Theory Components (40 marks total)
    midterm: {
      type: Number,
      default: 0,
      min: 0,
      max: 15,
    },
    assignment: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    cep: {
      type: Number,
      default: 0,
      min: 0,
      max: 15,
    },
    // Final Examination (60 marks)
    finalExam: {
      type: Number,
      default: 0,
      min: 0,
      max: 60,
    },
    // Practical Components (50 marks total)
    report: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    rubric: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    oe: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    quiz: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    practicalFinal: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    // Calculated fields
    totalMarks: {
      type: Number,
      default: 0,
    },
    // CLO Attainment (will be calculated)
    cloAttainment: [
      {
        cloId: {
          type: String,
          required: true,
        },
        cloName: {
          type: String,
          required: true,
        },
        marksObtained: {
          type: Number,
          default: 0,
        },
        totalMarks: {
          type: Number,
          required: true,
        },
        attainmentPercent: {
          type: Number,
          default: 0,
        },
        linkedPLO: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Calculate total marks before saving
AssessmentSchema.pre("save", function (next) {
  this.totalMarks =
    (this.midterm || 0) +
    (this.assignment || 0) +
    (this.cep || 0) +
    (this.finalExam || 0) +
    (this.report || 0) +
    (this.rubric || 0) +
    (this.oe || 0) +
    (this.quiz || 0) +
    (this.practicalFinal || 0)
  next()
})

export default mongoose.models.Assessment || mongoose.model("Assessment", AssessmentSchema)

