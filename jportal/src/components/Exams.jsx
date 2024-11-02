import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Exams({ w }) {
  const [semesters, setSemesters] = useState([])
  const [examEvents, setExamEvents] = useState([])
  const [selectedSem, setSelectedSem] = useState(null)

  useEffect(() => {
    // Fetch semesters on component mount
    const fetchSemesters = async () => {
      const examSems = await w.get_semesters_for_exam_events()
      setSemesters(examSems)
    }
    fetchSemesters()
  }, [])

  // Fetch exam events when semester is selected
  const handleSemesterChange = async (value) => {
    const semester = semesters.find(sem => sem.registration_id === value)
    setSelectedSem(semester)
    const examEvents = await w.get_exam_events(semester)
    setExamEvents(examEvents)
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={handleSemesterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select semester" />
        </SelectTrigger>
        <SelectContent>
          {semesters.map((sem) => (
            <SelectItem key={sem.registration_id} value={sem.registration_id}>
              {sem.registration_code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSem && (
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select exam event" />
          </SelectTrigger>
          <SelectContent>
            {examEvents.map((event) => (
              <SelectItem key={event.exam_event_id} value={event.exam_event_id}>
                {event.exam_event_desc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}