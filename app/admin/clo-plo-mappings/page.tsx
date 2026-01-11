"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  getCloPloMappings,
  getCloPloMappingsByCourseId,
  deleteCloPloMappingsByCourseId,
  CloPloMapping,
} from "@/lib/clo-plo-mapping-service"
import { getAllPrograms } from "@/lib/program-service"
import { getAllCourses, getCourseById } from "@/lib/course-service"
import { Loader2, Network, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Component for rendering a single course mapping table
function CourseMappingCard({
  courseData,
  onDelete,
  isDeleting,
}: {
  courseData: CourseMapping
  onDelete: (courseId: number) => void
  isDeleting: boolean
}) {
  // Fetch course details for display name
  const { data: courseDetail } = useQuery({
    queryKey: ["course", courseData.courseId],
    queryFn: () => getCourseById(courseData.courseId),
    enabled: !!courseData.courseId,
  })
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:50',message:'CourseMappingCard render',data:{courseId:courseData.courseId,hasCourseDetail:!!courseDetail,closLength:courseData.clos?.length,plosLength:courseData.plos?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'RENDER'})}).catch(()=>{});
  // #endregion

  const displayName = courseDetail?.course_name || courseData.courseName
  const displayCode = courseDetail?.course_code || courseData.courseCode

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case "C":
        return "Cognitive"
      case "P":
        return "Psychomotor"
      case "A":
        return "Affective"
      default:
        return domain
    }
  }

  const getLevelLabel = (level: number) => {
    const labels = [
      "1 - Remember",
      "2 - Understand",
      "3 - Apply",
      "4 - Analyze",
      "5 - Evaluate",
      "6 - Create",
    ]
    return labels[level - 1] || level.toString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {displayCode} - {displayName}
            </CardTitle>
            <CardDescription>CLO-PLO Mappings for this course</CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(courseData.courseId)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Mappings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!courseData?.clos || !courseData?.plos || !Array.isArray(courseData.clos) || !Array.isArray(courseData.plos) || courseData.clos.length === 0 || courseData.plos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {(!courseData?.clos || !Array.isArray(courseData.clos) || courseData.clos.length === 0) && "No CLOs found. "}
            {(!courseData?.plos || !Array.isArray(courseData.plos) || courseData.plos.length === 0) && "No PLOs found. "}
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                    CLO / PLO
                  </th>
                  {courseData.plos && Array.isArray(courseData.plos) && courseData.plos.map((plo) => (
                    <th
                      key={plo.id}
                      className="border border-gray-300 p-3 text-center font-semibold min-w-[220px]"
                    >
                      <div className="font-bold">{plo.code}</div>
                      <div className="text-xs font-normal text-gray-600 mt-1">{plo.title}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseData.clos && Array.isArray(courseData.clos) && courseData.clos.map((clo) => (
                  <tr key={clo.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium sticky left-0 bg-white z-10">
                      <div className="font-bold">CLO-{clo.number}</div>
                      <div className="text-xs text-gray-600 mt-1 max-w-[200px]">
                        {clo.description}
                      </div>
                    </td>
                    {courseData.plos && Array.isArray(courseData.plos) && courseData.plos.map((plo) => {
                      const key = `${clo.id}-${plo.id}`
                      const cellData = courseData.mappingMatrix?.[key]

                      return (
                        <td key={plo.id} className="border border-gray-300 p-3">
                          {cellData ? (
                            <div className="space-y-2">
                              <div>
                                <Badge variant="secondary" className="text-xs">
                                  {getDomainLabel(cellData.domain)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-700">
                                Level: {getLevelLabel(cellData.level)}
                              </div>
                              {cellData.weightage > 0 && (
                                <div className="text-sm text-gray-600">
                                  Weightage: {cellData.weightage}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-sm">-</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Transform flat mapping data into course-grouped structure
interface CourseMapping {
  courseId: number
  courseName: string
  courseCode: string
  clos: Array<{
    id: number
    number: number
    description: string
  }>
  plos: Array<{
    id: number
    code: string
    title: string
  }>
  mappingMatrix: Record<string, { domain: string; level: number; weightage: number }>
}

function transformMappingData(mappings: CloPloMapping[]): CourseMapping[] {
  // Ensure mappings is always an array
  if (!Array.isArray(mappings) || mappings.length === 0) {
    return []
  }
  
  console.log("Transforming mappings:", mappings)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:57',message:'Transform function entry',data:{mappingsCount:mappings.length,firstMapping:mappings[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  
  // Group by course
  const courseMap = new Map<number, CloPloMapping[]>()
  
  mappings.forEach((mapping, index) => {
    // FIX: Use flat structure - course_id is directly on mapping, not nested
    const courseId = (mapping as any).course_id
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:70',message:'Processing mapping FIXED',data:{index,courseId:courseId,hasFlatCourseId:!!(mapping as any).course_id,mappingKeys:Object.keys(mapping)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'FIX'})}).catch(()=>{});
    // #endregion
    
    if (courseId) {
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, [])
      }
      courseMap.get(courseId)!.push(mapping)
    }
  })
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:84',message:'After grouping',data:{courseMapSize:courseMap.size,courseIds:Array.from(courseMap.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
  // #endregion

  // Transform each course
  const result: CourseMapping[] = []
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:88',message:'Before courseMap forEach',data:{courseMapSize:courseMap.size,willIterate:courseMap.size > 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  courseMap.forEach((courseMappings, courseId) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:95',message:'Processing course',data:{courseId,mappingsCount:courseMappings.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    
    // Extract unique CLOs
    const cloMap = new Map<number, { id: number; number: number; description: string }>()
    // Extract unique PLOs
    const ploMap = new Map<number, { id: number; code: string; title: string }>()
    // Build mapping matrix
    const mappingMatrix: Record<string, { domain: string; level: number; weightage: number }> = {}

    courseMappings.forEach((mapping) => {
      // FIX: Use flat structure
      const mappingFlat = mapping as any
      
      // Add CLO from flat data
      if (mappingFlat.clo_id && !cloMap.has(mappingFlat.clo_id)) {
        cloMap.set(mappingFlat.clo_id, {
          id: mappingFlat.clo_id,
          number: mappingFlat.clo_number || 0,
          description: mappingFlat.clo_description || `CLO ${mappingFlat.clo_number}`,
        })
      }
      
      // Add PLO from flat data
      if (mappingFlat.plo_id && !ploMap.has(mappingFlat.plo_id)) {
        ploMap.set(mappingFlat.plo_id, {
          id: mappingFlat.plo_id,
          code: mappingFlat.plo_code || `PLO-${mappingFlat.plo_id}`,
          title: mappingFlat.plo_title || mappingFlat.plo_code || `PLO ${mappingFlat.plo_id}`,
        })
      }

      // Add to matrix
      const key = `${mappingFlat.clo_id}-${mappingFlat.plo_id}`
      mappingMatrix[key] = {
        domain: mappingFlat.domain,
        level: mappingFlat.level,
        weightage: Number.parseFloat(mappingFlat.weightage) || 0,
      }
    })

    // Get course name/code from first mapping
    const firstMapping = courseMappings[0]
    
    // Ensure clos and plos are always arrays
    const clos = Array.from(cloMap.values()).sort((a, b) => a.number - b.number)
    const plos = Array.from(ploMap.values())
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:298',message:'After extraction',data:{courseId,cloCount:clos.length,ploCount:plos.length,matrixKeys:Object.keys(mappingMatrix).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D,E'})}).catch(()=>{});
    // #endregion
    
    const courseData: CourseMapping = {
      courseId,
      courseName: `Course ${courseId}`, // Will be updated by separate query
      courseCode: `C${courseId}`,
      clos: Array.isArray(clos) ? clos : [],
      plos: Array.isArray(plos) ? plos : [],
      mappingMatrix: mappingMatrix || {},
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:310',message:'Pushing course data',data:{courseId,closLength:courseData.clos.length,plosLength:courseData.plos.length,closIsArray:Array.isArray(courseData.clos),plosIsArray:Array.isArray(courseData.plos)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    
    result.push(courseData)
  })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:320',message:'Transform function exit',data:{resultLength:result.length,resultIsArray:Array.isArray(result),firstCourse:result[0] ? {courseId:result[0].courseId,closLength:result[0].clos?.length,plosLength:result[0].plos?.length,closIsArray:Array.isArray(result[0].clos),plosIsArray:Array.isArray(result[0].plos)} : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'ALL'})}).catch(()=>{});
  // #endregion

  console.log("Transformed data:", result)
  // Always return an array
  return Array.isArray(result) ? result : []
}

export default function CloPloMappingsPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch programs
  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Fetch courses (filtered by program if selected)
  const { data: courses = [] } = useQuery({
    queryKey: ["courses", selectedProgramId],
    queryFn: () =>
      selectedProgramId && selectedProgramId !== "all"
        ? getAllCourses(Number.parseInt(selectedProgramId))
        : getAllCourses(),
    enabled: true,
  })

  // Fetch all mappings with pagination (default mode)
  const {
    data: allMappingsData,
    isLoading: allMappingsLoading,
    error: allMappingsError,
  } = useQuery({
    queryKey: ["all-clo-plo-mappings", page, limit],
    queryFn: async () => {
      const result = await getCloPloMappings({ page, limit })
      console.log("All Mappings API Response:", result)
      return result
    },
    enabled: selectedCourseId === "all",
  })

  // Fetch mappings for specific course
  const {
    data: courseMappings,
    isLoading: courseMappingsLoading,
    error: courseMappingsError,
  } = useQuery({
    queryKey: ["clo-plo-mappings-by-course", selectedCourseId],
    queryFn: async () => {
      const result = await getCloPloMappingsByCourseId(Number.parseInt(selectedCourseId))
      console.log("Course Mappings API Response:", result)
      return result
    },
    enabled: selectedCourseId !== "all" && !!selectedCourseId,
  })

  // Extract mappings array from response
  let mappingsToDisplay: CloPloMapping[] = []
  
  if (selectedCourseId === "all") {
    if (allMappingsData) {
      mappingsToDisplay = Array.isArray(allMappingsData) 
        ? allMappingsData 
        : (Array.isArray(allMappingsData.data) ? allMappingsData.data : [])
    }
  } else {
    if (courseMappings) {
      console.log("Course Mappings:", JSON.stringify(courseMappings, null, 2))
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:197',message:'Course mappings received FIXED',data:{isArray:Array.isArray(courseMappings),hasClosProp:'clos' in courseMappings,type:typeof courseMappings,keys:typeof courseMappings === 'object' ? Object.keys(courseMappings) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'FIX'})}).catch(()=>{});
      // #endregion
      
      // FIX: Handle the specific course API response which returns {course_id, course_code, clos: [...]}
      if (Array.isArray(courseMappings)) {
        mappingsToDisplay = courseMappings
      } else if (courseMappings && typeof courseMappings === 'object') {
        const courseMappingsAny = courseMappings as any
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:397',message:'Course mappings object structure',data:{hasClos:'clos' in courseMappingsAny,hasData:'data' in courseMappingsAny,hasMappings:'mappings' in courseMappingsAny,closType:courseMappingsAny.clos ? typeof courseMappingsAny.clos : null,closIsArray:Array.isArray(courseMappingsAny.clos),closLength:courseMappingsAny.clos?.length,keys:Object.keys(courseMappingsAny)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'FIX'})}).catch(()=>{});
        // #endregion
        
        // Check if it has clos property (course-specific endpoint)
        // The clos property might contain CLO objects with nested plo_mappings
        if ('clos' in courseMappingsAny && Array.isArray(courseMappingsAny.clos)) {
          // If clos contains full CLO objects with mappings, flatten them
          const flattenedMappings: any[] = []
          courseMappingsAny.clos.forEach((clo: any) => {
            if (clo.plo_mappings && Array.isArray(clo.plo_mappings)) {
              clo.plo_mappings.forEach((ploMapping: any) => {
                flattenedMappings.push({
                  clo_id: clo.id || clo.clo_id,
                  clo_number: clo.clo_number || clo.number,
                  course_id: courseMappingsAny.course_id,
                  course_code: courseMappingsAny.course_code,
                  plo_id: ploMapping.plo_id,
                  plo_code: ploMapping.plo_code || `PLO-${ploMapping.plo_id}`,
                  domain: ploMapping.domain,
                  level: ploMapping.level,
                  weightage: ploMapping.weightage,
                })
              })
            }
          })
          mappingsToDisplay = flattenedMappings.length > 0 ? flattenedMappings : courseMappingsAny.clos
        } else if ('data' in courseMappingsAny && Array.isArray(courseMappingsAny.data)) {
          mappingsToDisplay = courseMappingsAny.data
        } else if ('mappings' in courseMappingsAny && Array.isArray(courseMappingsAny.mappings)) {
          mappingsToDisplay = courseMappingsAny.mappings
        } else {
          mappingsToDisplay = []
        }
      }
    }
  }

  console.log("Mappings to display:", mappingsToDisplay)
  console.log("Is array:", Array.isArray(mappingsToDisplay))
  console.log("Length:", mappingsToDisplay.length)

  // Transform flat data into course-grouped structure
  let courseMappingData: CourseMapping[] = []
  try {
    const transformed = transformMappingData(mappingsToDisplay)
    courseMappingData = Array.isArray(transformed) ? transformed : []
  } catch (error) {
    console.error("Error transforming mapping data:", error)
    courseMappingData = []
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:410',message:'Course mapping data check',data:{courseMappingDataExists:!!courseMappingData,isArray:Array.isArray(courseMappingData),length:courseMappingData.length,mappingsToDisplayLength:mappingsToDisplay.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'HOOKS'})}).catch(()=>{});
  // #endregion

  // Ensure courseMappingData is always an array with valid structure
  let safeCourseMappingData: CourseMapping[] = []
  if (Array.isArray(courseMappingData) && courseMappingData.length > 0) {
    safeCourseMappingData = courseMappingData.map((cm) => ({
      courseId: cm.courseId || 0,
      courseName: cm.courseName || `Course ${cm.courseId}`,
      courseCode: cm.courseCode || `C${cm.courseId}`,
      clos: Array.isArray(cm.clos) ? cm.clos : [],
      plos: Array.isArray(cm.plos) ? cm.plos : [],
      mappingMatrix: cm.mappingMatrix || {},
    }))
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:435',message:'Safe course mapping data',data:{safeLength:safeCourseMappingData.length,willMap:safeCourseMappingData.length > 0,firstCourse:safeCourseMappingData[0] ? {courseId:safeCourseMappingData[0].courseId,closLength:safeCourseMappingData[0].clos?.length,plosLength:safeCourseMappingData[0].plos?.length,closIsArray:Array.isArray(safeCourseMappingData[0].clos),plosIsArray:Array.isArray(safeCourseMappingData[0].plos)} : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'RENDER'})}).catch(()=>{});
  // #endregion
  
  // Fetch course details - use individual queries for each course ID (max reasonable number)
  // Since we can't use hooks dynamically, we'll fetch on render with a helper component

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCloPloMappingsByCourseId,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CLO-PLO mappings deleted successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["all-clo-plo-mappings"] })
      queryClient.invalidateQueries({ queryKey: ["clo-plo-mappings-by-course"] })
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mappings",
        variant: "destructive",
      })
    },
  })

  const handleDeleteClick = (courseId: number) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete)
    }
  }

  const isLoading = selectedCourseId === "all" ? allMappingsLoading : courseMappingsLoading
  const error = selectedCourseId === "all" ? allMappingsError : courseMappingsError

  // Calculate total pages
  const totalMappings = allMappingsData && typeof allMappingsData === 'object' && 'total' in allMappingsData 
    ? allMappingsData.total 
    : mappingsToDisplay.length
  
  const totalPages = totalMappings > 0 ? Math.ceil(totalMappings / limit) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CLO-PLO Mappings</h1>
        <p className="text-gray-600 mt-2">View existing CLO-PLO mappings for courses</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter mappings by program or select a specific course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Filter */}
            <div className="space-y-2">
              <Label>Program (Optional)</Label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.code} - {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="space-y-2">
              <Label>Course (Optional)</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mappings Display */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading mappings...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-600">
              Error loading mappings: {(error as Error).message}
            </div>
          </CardContent>
        </Card>
      ) : !safeCourseMappingData || safeCourseMappingData.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No CLO-PLO mappings found</p>
              <p className="text-sm mt-2">
                {selectedCourseId !== "all"
                  ? "No mappings exist for the selected course."
                  : "No mappings exist yet. Create mappings from the course view page."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Render one table per course */}
          <div className="space-y-6">
            {Array.isArray(safeCourseMappingData) && safeCourseMappingData.length > 0 ? (
              safeCourseMappingData.map((courseData, index) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/112ea5a3-ae75-4011-8042-f8415db80f7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:573',message:'Mapping course',data:{index,courseId:courseData?.courseId,hasClos:!!courseData?.clos,closLength:courseData?.clos?.length,hasPlos:!!courseData?.plos,plosLength:courseData?.plos?.length,hasMatrix:!!courseData?.mappingMatrix,courseDataKeys:courseData ? Object.keys(courseData) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'RENDER'})}).catch(()=>{});
                // #endregion
                
                if (!courseData) return null
                
                // Ensure courseData has required properties
                if (!courseData.clos || !Array.isArray(courseData.clos)) {
                  console.warn(`Course ${courseData.courseId} has invalid clos:`, courseData.clos)
                  courseData.clos = []
                }
                if (!courseData.plos || !Array.isArray(courseData.plos)) {
                  console.warn(`Course ${courseData.courseId} has invalid plos:`, courseData.plos)
                  courseData.plos = []
                }
                if (!courseData.mappingMatrix) {
                  courseData.mappingMatrix = {}
                }
                
                return (
                  <CourseMappingCard
                    key={courseData.courseId || index}
                    courseData={courseData}
                    onDelete={handleDeleteClick}
                    isDeleting={deleteMutation.isPending && courseToDelete === courseData.courseId}
                  />
                )
              })
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    No course mapping data available to render
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination (only for "All Courses" mode) */}
          {selectedCourseId === "all" && totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages} • Total: {totalMappings} mapping(s)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CLO-PLO Mappings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all CLO-PLO mappings for this course. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
