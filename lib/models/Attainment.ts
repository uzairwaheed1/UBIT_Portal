import mongoose from "mongoose";

const AttainmentSchema = new mongoose.Schema(
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
    cloId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CLO",
      required: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AttainmentSchema.virtual("attainment").get(function () {
  return (this.marksObtained / this.totalMarks) * 100;
});

AttainmentSchema.set("toJSON", { virtuals: true });
AttainmentSchema.set("toObject", { virtuals: true });

export default mongoose.models.Attainment || mongoose.model("Attainment", AttainmentSchema);