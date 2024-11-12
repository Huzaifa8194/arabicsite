"use client";

import { BookIcon, CheckCircle, PlayCircle } from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import LockIconWrapper from "./LockIconWrapper";
import { useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import {
  Lesson,
  Prisma,
  Quiz,
  UserProgress,
  UserQuizPoints,
} from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  JSXElementConstructor,
  Key,
 
  ReactElement,
  ReactNode,
  ReactPortal,
  useCallback,
  useEffect,
  useRef,
} from "react";

type ExamWithQuestionAndOptions = Prisma.ExamGetPayload<{
  include: {
    questions: {
      where: {
        isPublished: true;
      };
      include: {
        options: true;
      };
    };
  };
}>;

interface CourseSidebarItemProps {
  lessons: any;
  quiz:
    | (Quiz & { userQuizPoints: UserQuizPoints[] | null; lock: boolean })
    | null;
  exam: any;
  label: string;
  id: string;
  courseId: string;
  starterExam: any;
  starterExamProgress: any;
}

export const CourseSidebarItem = ({
  label,
  lessons,
  id,
  courseId,
  exam,
  quiz,
  starterExam,
  starterExamProgress,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  const accordionTrigerRef = useRef<HTMLButtonElement>(null);

  const isActive = pathname?.includes(id);

  const isChapterCompleted = lessons.every((lesson: { userProgress: any[] }) =>
    lesson.userProgress?.every(
      (progress: { userId: string | null | undefined; isCompleted: boolean }) =>
        progress.userId === userId && progress.isCompleted === true
    )
  );

  const hasTakenQuiz =
    quiz &&
    quiz.userQuizPoints?.find(
      (userQuizPoint) => userQuizPoint.userId === userId
    ) !== undefined;

  const handleLessonClick = (lessonId: string) => {
    router.replace(`/courses/${courseId}/chapters/${id}/lessons/${lessonId}`);
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/courses/${courseId}/chapters/${id}/quiz/${quizId}`);
  };

  const handleChapterClick = () => {
    redirect(`/courses/${courseId}/chapters/${id}`);
  };

  useEffect(() => {
    const ref = accordionTrigerRef.current;

    const handleClick = () => {
      if (ref?.dataset.state === "open") {
        handleChapterClick();
      }
    };

    ref?.addEventListener("click", handleClick);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      ref?.removeEventListener("click", handleClick);
    };
  }, [handleChapterClick]); // Empty dependency array to run the effect only once

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value={label}>
          <AccordionTrigger
            ref={accordionTrigerRef}
            className={cn(
              "flex items-center text-sky-500 text-right gap-x-2  text-sm font-[500] pl-6 pr-4 py-4 transition-all hover:text-slate-600 hover:bg-slate-300/20",
              isActive &&
                "text-slate-700 bg-sky-200/20 hover:bg-slate-200/20 hover:text-slate-700",
              isChapterCompleted &&
                "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
            )}
          >
            <div className="ml-auto">{label}</div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 w-full">
            {lessons.map(
              (
                lesson: {
                  id: string;
                  lock: boolean;
                  userProgress: any[];
                  title:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    
                    | null
                    | undefined;
                },
                index: Key | null | undefined
              ) => {
                return (
                  <button
                    key={index}
                    onClick={() => handleLessonClick(lesson.id)}
                    type="button"
                    disabled={lesson.lock || false}
                    className={cn(
                      "flex items-center justify-end w-full gap-x-2 text-slate-600 text-sm font-[500] transition-all px-4 hover:text-slate-700 hover:bg-slate-300/20 border-r-4 border-opacity-0 hover:border-opacity-100  border-sky-700 h-full",
                      pathname?.includes(lesson.id) &&
                        "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700",
                      pathname?.includes(lesson.id) &&
                        lesson.userProgress?.some(
                          (progress: {
                            userId: string | null | undefined;
                            isCompleted: any;
                          }) =>
                            progress.userId === userId && progress.isCompleted
                        ) &&
                        "text-sky-700 bg-emerald-200/20 hover:bg-emerald-200/20 hover:text-emerald-700",
                      lesson.userProgress?.some(
                        (progress: {
                          userId: string | null | undefined;
                          isCompleted: any;
                        }) => progress.userId === userId && progress.isCompleted
                      ) && "text-sky-700"
                    )}
                  >
                    <div className="flex items-center justify-between text-right w-full gap-x-2 py-4">
                      {lesson.userProgress?.some(
                        (progress: {
                          userId: string | null | undefined;
                          isCompleted: any;
                        }) => progress.userId === userId && progress.isCompleted
                      ) ? (
                        <CheckCircle
                          size={22}
                          className={cn(
                            "flex-shrink-0",
                            "text-sky-500",
                            pathname?.includes(lesson.id) && "text-sky-700"
                          )}
                        />
                      ) : lesson.lock == true ? (
                        <LockIconWrapper
                          className={cn(
                            "text-slate-500",
                            pathname?.includes(lesson.id) && "text-slate-700"
                          )}
                        />
                      ) : (
                        <PlayCircle
                          size={22}
                          className={cn(
                            "flex-shrink-0",
                            "text-slate-500",
                            pathname?.includes(lesson.id) && "text-slate-700"
                          )}
                        />
                      )}
                      <div className="">{lesson.title}</div>
                    </div>
                  </button>
                );
              }
            )}
            {quiz && (
              <button
                onClick={() => {
                  handleQuizClick(quiz.id);
                }}
                disabled={quiz.lock ? true : false}
                type="button"
                className={cn(
                  `flex ${
                    pathname?.includes(quiz.id)
                      ? "bg-emerald-200/20 hover:bg-emerald-200/20 hover:text-emerald-700"
                      : ""
                  } mt-auto items-center justify-end w-full gap-x-2 text-yellow-600 text-sm font-[500] transition-all px-4 hover:text-yellow-700 hover:bg-sky-300/20 border-r-4 border-opacity-0 hover:border-opacity-100  border-orange-600 h-full`,

                  hasTakenQuiz &&
                    ` ${
                      quiz.lock
                        ? "text-yellow-600 hover:text-yellow-700"
                        : "text-sky-600 hover:text-sky-700"
                    } hover:bg-yellow-200/20  border-yellow-700`
                )}
              >
                <div className="flex items-center justify-between text-right w-full gap-x-2 py-4">
                  {quiz.lock ? (
                    <LockIconWrapper className="text-yellow-600 hover:text-yellow-700" />
                  ) : hasTakenQuiz ? (
                    <CheckCircle size={22} className={cn("text-sky-500")} />
                  ) : (
                    <PlayCircle
                      size={22}
                      className={cn("text-yellow-600 hover:text-yellow-700")}
                    />
                  )}
                  <div>
                    <span></span>
                    {quiz.title}
                  </div>
                </div>
              </button>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
