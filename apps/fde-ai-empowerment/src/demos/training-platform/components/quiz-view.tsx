"use client";

import { useTraining } from "../training-context";

export function QuizView() {
  const {
    quiz,
    startQuiz,
    quizAnswers,
    setQuizAnswer,
    submitQuiz,
    quizGrade,
    myPath,
  } = useTraining();

  const activeStage = myPath.stages.find((s) => s.status === "active");

  if (!quiz) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-600">从学习路径进入测验，或点击下方开始</p>
        <button
          type="button"
          onClick={() => startQuiz(activeStage?.quiz ?? "销售技巧")}
          className="mt-4 rounded-lg bg-violet-600 px-6 py-2 text-sm text-white"
        >
          生成 AI 测验
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-800">
            {idx + 1}. [{q.type}] {q.question}
          </p>
          {q.type === "short" ? (
            <textarea
              className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm"
              rows={2}
              onChange={(e) => setQuizAnswer(q.id, e.target.value)}
            />
          ) : (
            <ul className="mt-2 space-y-1">
              {q.options?.map((opt) => {
                const selected = quizAnswers.find((a) => a.questionId === q.id);
                const isMulti = q.type === "multi";
                const checked = isMulti
                  ? Array.isArray(selected?.value) && selected.value.includes(opt)
                  : selected?.value === opt;
                return (
                  <li key={opt}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-2 text-sm hover:bg-violet-50">
                      <input
                        type={isMulti ? "checkbox" : "radio"}
                        name={q.id}
                        checked={!!checked}
                        onChange={() => {
                          if (isMulti) {
                            const prev = Array.isArray(selected?.value)
                              ? selected.value
                              : [];
                            const next = checked
                              ? prev.filter((x) => x !== opt)
                              : [...prev, opt];
                            setQuizAnswer(q.id, next);
                          } else {
                            setQuizAnswer(q.id, opt);
                          }
                        }}
                      />
                      {opt}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {quizGrade && (
            <p
              className={`mt-2 text-xs ${
                quizGrade.details.find((d) => d.questionId === q.id)?.correct
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {quizGrade.details.find((d) => d.questionId === q.id)?.explanation}
            </p>
          )}
        </div>
      ))}
      {!quizGrade ? (
        <button
          type="button"
          onClick={submitQuiz}
          className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white"
        >
          提交并评分
        </button>
      ) : (
        <p className="text-center text-lg font-bold text-violet-800">
          得分 {quizGrade.score} / {quizGrade.total}
        </p>
      )}
    </div>
  );
}
