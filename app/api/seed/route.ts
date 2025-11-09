import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"
import Course from "@/lib/models/Course"

// Sample Students Data
const sampleStudents = [
  {
    rollNo: "S2021001",
    name: "Ahmed Khan",
    email: "ahmed.khan@university.edu",
    semester: 5,
    domain: "CS",
  },
  {
    rollNo: "S2021002",
    name: "Fatima Ali",
    email: "fatima.ali@university.edu",
    semester: 5,
    domain: "CS",
  },
  {
    rollNo: "S2021003",
    name: "Hassan Malik",
    email: "hassan.malik@university.edu",
    semester: 5,
    domain: "SE",
  },
  {
    rollNo: "S2021004",
    name: "Ayesha Sheikh",
    email: "ayesha.sheikh@university.edu",
    semester: 5,
    domain: "SE",
  },
  {
    rollNo: "S2021005",
    name: "Usman Ahmed",
    email: "usman.ahmed@university.edu",
    semester: 5,
    domain: "AI",
  },
  {
    rollNo: "S2021006",
    name: "Zainab Hassan",
    email: "zainab.hassan@university.edu",
    semester: 5,
    domain: "AI",
  },
  {
    rollNo: "S2021007",
    name: "Bilal Raza",
    email: "bilal.raza@university.edu",
    semester: 6,
    domain: "CS",
  },
  {
    rollNo: "S2021008",
    name: "Maryam Khan",
    email: "maryam.khan@university.edu",
    semester: 6,
    domain: "CS",
  },
  {
    rollNo: "S2021009",
    name: "Omar Farooq",
    email: "omar.farooq@university.edu",
    semester: 6,
    domain: "SE",
  },
  {
    rollNo: "S2021010",
    name: "Sara Ahmed",
    email: "sara.ahmed@university.edu",
    semester: 6,
    domain: "SE",
  },
]

// Sample Courses Data
const sampleCourses = [
  {
    courseCode: "CS301",
    courseName: "Data Structures and Algorithms",
    credits: 3,
    semester: 5,
    instructor: "Dr. Alana Reed",
  },
  {
    courseCode: "SE305",
    courseName: "Software Engineering",
    credits: 3,
    semester: 5,
    instructor: "Dr. Alana Reed",
  },
  {
    courseCode: "CS401",
    courseName: "Advanced Algorithms",
    credits: 4,
    semester: 6,
    instructor: "Dr. Alana Reed",
  },
  {
    courseCode: "AI301",
    courseName: "Machine Learning Fundamentals",
    credits: 3,
    semester: 5,
    instructor: "Dr. Alana Reed",
  },
  {
    courseCode: "SE401",
    courseName: "Software Project Management",
    credits: 3,
    semester: 6,
    instructor: "Dr. Alana Reed",
  },
]

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { type } = await request.json()
    let createdStudents = []
    let createdCourses = []

    // Seed Students
    if (!type || type === "students" || type === "all") {
      for (const studentData of sampleStudents) {
        try {
          // Check if student already exists
          const existingStudent = await Student.findOne({
            $or: [{ rollNo: studentData.rollNo }, { email: studentData.email }],
          })

          if (!existingStudent) {
            const student = new Student(studentData)
            await student.save()
            createdStudents.push(student)
          }
        } catch (error: any) {
          // Skip if duplicate or other error
          console.log(`Student ${studentData.rollNo} might already exist:`, error.message)
        }
      }
    }

    // Seed Courses
    if (!type || type === "courses" || type === "all") {
      for (const courseData of sampleCourses) {
        try {
          // Check if course already exists
          const existingCourse = await Course.findOne({ courseCode: courseData.courseCode })

          if (!existingCourse) {
            const course = new Course(courseData)
            await course.save()
            createdCourses.push(course)
          }
        } catch (error: any) {
          // Skip if duplicate or other error
          console.log(`Course ${courseData.courseCode} might already exist:`, error.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully",
      data: {
        studentsCreated: createdStudents.length,
        coursesCreated: createdCourses.length,
        students: createdStudents,
        courses: createdCourses,
      },
    })
  } catch (error: any) {
    console.error("Error seeding data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed sample data",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()

    const studentCount = await Student.countDocuments()
    const courseCount = await Course.countDocuments()

    return NextResponse.json({
      success: true,
      data: {
        studentCount,
        courseCount,
        sampleStudentsCount: sampleStudents.length,
        sampleCoursesCount: sampleCourses.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch seed data info",
      },
      { status: 500 }
    )
  }
}

