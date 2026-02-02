import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, GraduationCap, Calculator, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

type Grade = "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "E8" | "F9" | "";

interface SubjectGrade {
  subject: string;
  grade: Grade;
}

const GRADE_TO_MARKS: Record<string, number> = {
  "A1": 90,
  "B2": 80,
  "B3": 75,
  "C4": 65,
  "C5": 60,
  "C6": 55,
  "D7": 45,
  "E8": 45,
  "F9": 0,
};

const GRADES: Grade[] = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const COURSE_REQUIREMENTS: Record<string, { subjects: string[]; cutoff: number; name: string }> = {
  medicine: {
    subjects: ["Biology", "Chemistry", "Physics", "English", "Mathematics"],
    cutoff: 60,
    name: "Medicine/Nursing/Allied Health",
  },
  engineering: {
    subjects: ["Physics", "Chemistry", "Mathematics", "English", "Elective"],
    cutoff: 55,
    name: "Engineering",
  },
  computer_science: {
    subjects: ["Physics", "Mathematics", "English", "Elective 1", "Elective 2"],
    cutoff: 50,
    name: "Computer Science",
  },
};

export default function EligibilityCalculator() {
  const [course, setCourse] = useState<string>("");
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [calculated, setCalculated] = useState(false);

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setCalculated(false);
    const courseReq = COURSE_REQUIREMENTS[value];
    if (courseReq) {
      setGrades(courseReq.subjects.map((subject) => ({ subject, grade: "" })));
    }
  };

  const handleGradeChange = (index: number, grade: Grade) => {
    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], grade };
      return updated;
    });
    setCalculated(false);
  };

  const allGradesEntered = grades.length > 0 && grades.every((g) => g.grade !== "");
  const hasFailingGrade = grades.some((g) => g.grade === "F9");

  const result = useMemo(() => {
    if (!calculated || !allGradesEntered) return null;

    const totalMarks = grades.reduce((sum, g) => sum + (GRADE_TO_MARKS[g.grade] || 0), 0);
    const equivalentScore = (totalMarks / 500) * 1100;
    const finalScore = equivalentScore * 0.9;
    const percentage = (finalScore / 1100) * 100;
    const cutoff = COURSE_REQUIREMENTS[course]?.cutoff || 50;

    let status: "eligible" | "marginal" | "not_eligible" = "not_eligible";
    if (hasFailingGrade) {
      status = "not_eligible";
    } else if (percentage >= cutoff) {
      status = "eligible";
    } else if (percentage >= cutoff - 2) {
      status = "marginal";
    }

    return {
      totalMarks,
      equivalentScore: Math.round(equivalentScore),
      finalScore: Math.round(finalScore),
      percentage: percentage.toFixed(1),
      status,
      cutoff,
    };
  }, [calculated, grades, course, allGradesEntered, hasFailingGrade]);

  const handleCalculate = () => {
    if (allGradesEntered) {
      setCalculated(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <img src={logoImg} alt="ConsultAfrique Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-primary">ConsultAfrique</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Calculator className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              WAEC/NECO Eligibility Calculator
            </h1>
            <p className="mt-3 text-muted-foreground">
              Check if your Nigerian WAEC/NECO results meet Pakistani 2026 undergraduate admission standards
            </p>
          </div>

          <Card className="mb-6" data-testid="card-course-selection">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Select Your Course
              </CardTitle>
              <CardDescription>
                Choose the course you want to apply for to see the required subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={course} onValueChange={handleCourseChange}>
                <SelectTrigger data-testid="select-course">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicine" data-testid="option-medicine">
                    Medicine/Nursing/Allied Health
                  </SelectItem>
                  <SelectItem value="engineering" data-testid="option-engineering">
                    Engineering
                  </SelectItem>
                  <SelectItem value="computer_science" data-testid="option-cs">
                    Computer Science
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {course && (
            <Card className="mb-6" data-testid="card-grade-input">
              <CardHeader>
                <CardTitle>Enter Your Grades</CardTitle>
                <CardDescription>
                  Provide your WAEC/NECO grades for the following 5 core subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((item, index) => (
                    <div key={item.subject} className="flex items-center gap-4">
                      <Label className="w-32 text-sm font-medium">{item.subject}</Label>
                      <Select
                        value={item.grade}
                        onValueChange={(value) => handleGradeChange(index, value as Grade)}
                      >
                        <SelectTrigger
                          className="flex-1"
                          data-testid={`select-grade-${item.subject.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <SelectValue placeholder="Select grade..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({GRADE_TO_MARKS[grade]} marks)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleCalculate}
                    disabled={!allGradesEntered}
                    className="w-full"
                    size="lg"
                    data-testid="button-calculate"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculate Eligibility
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card
              className={`border-2 ${
                result.status === "eligible"
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : result.status === "marginal"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                    : "border-red-500 bg-red-50 dark:bg-red-950/20"
              }`}
              data-testid="card-result"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Results</span>
                  {result.status === "eligible" ? (
                    <Badge className="bg-green-600 hover:bg-green-700" data-testid="badge-eligible">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Eligible
                    </Badge>
                  ) : result.status === "marginal" ? (
                    <Badge className="bg-yellow-600 hover:bg-yellow-700" data-testid="badge-marginal">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Marginally Eligible
                    </Badge>
                  ) : (
                    <Badge className="bg-red-600 hover:bg-red-700" data-testid="badge-not-eligible">
                      <XCircle className="mr-1 h-4 w-4" />
                      Not Eligible
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-background p-4">
                    <div className="text-sm text-muted-foreground">WAEC/NECO Total</div>
                    <div className="text-2xl font-bold">{result.totalMarks}/500</div>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <div className="text-sm text-muted-foreground">Scaled Score (before deduction)</div>
                    <div className="text-2xl font-bold">{result.equivalentScore}/1100</div>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <div className="text-sm text-muted-foreground">Estimated Pakistani Marks</div>
                    <div className="text-2xl font-bold text-primary">{result.finalScore}/1100</div>
                    <div className="text-xs text-muted-foreground">(After 10% IBCC deduction)</div>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <div className="text-sm text-muted-foreground">Estimated Percentage</div>
                    <div className="text-2xl font-bold text-primary">{result.percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      Course cutoff: {result.cutoff}%
                    </div>
                  </div>
                </div>

                {hasFailingGrade && (
                  <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                    <strong>Note:</strong> You have an F9 grade which makes you immediately ineligible
                    for professional courses. Consider retaking the exam to improve your grades.
                  </div>
                )}

                {result.status === "marginal" && (
                  <div className="mt-4 rounded-lg bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                    <strong>Note:</strong> Your score is within 2% of the cutoff. You may be considered
                    depending on seat availability and competition. We recommend contacting us for
                    personalized guidance.
                  </div>
                )}

                {result.status === "eligible" && (
                  <div className="mt-4 rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    <strong>Congratulations!</strong> Your grades meet the eligibility requirements.
                    Contact us to begin your application process for studying in Pakistan.
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/#contact" className="flex-1">
                    <Button className="w-full" data-testid="button-contact-us">
                      Contact Us for Guidance
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCourse("");
                      setGrades([]);
                      setCalculated(false);
                    }}
                    className="flex-1"
                    data-testid="button-reset"
                  >
                    Calculate Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">How This Calculator Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <strong>Grade Conversion:</strong> Your WAEC/NECO grades are converted to marks
                  (A1=90, B2=80, B3=75, C4=65, C5=60, C6=55, D7/E8=45, F9=0)
                </li>
                <li>
                  <strong>Equivalence Scaling:</strong> Total marks are scaled to Pakistani equivalent
                  using the formula: (Sum of 5 Subjects / 500) x 1100
                </li>
                <li>
                  <strong>IBCC Deduction:</strong> A standard 10% deduction is applied to align with
                  the Pakistani local curve
                </li>
                <li>
                  <strong>Eligibility Check:</strong> Final percentage is compared against the
                  course-specific cutoff requirements
                </li>
              </ol>
              <p className="mt-4 text-xs">
                * This calculator provides an estimate based on IBCC 2026 guidelines. Actual
                admission decisions may vary based on university-specific requirements and seat
                availability.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
