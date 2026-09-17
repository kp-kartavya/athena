import { useState } from "react";
import { QUICK_QUESTIONS } from "../../../utils/constants";
import "./quickQuestions.css";

const QuickQuestions = ({ isLoading, onQuestionSelect, variant = "chat" }) => {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const questionCategories = Object.entries(QUICK_QUESTIONS);

  const visibleCategories = showAllQuestions
    ? questionCategories
    : questionCategories.slice(0, 3);

  const totalQuestions = questionCategories.reduce(
    (total, [, questions]) => total + questions.length,
    0,
  );

  const variantClass =
    variant === "guest" ? "quick-questions--guest" : "quick-questions--chat";

  return (
    <div className={`quick-questions ${variantClass}`}>
      <div className="quick-questions-header">
        <div>
          <h3>Quick Questions</h3>

          <p>Practice questions from your interview preparation set</p>
        </div>

        <span className="quick-question-count">{totalQuestions} questions</span>
      </div>

      <div className="quick-question-categories">
        {visibleCategories.map(([categoryName, questions]) => (
          <div className="quick-question-category" key={categoryName}>
            <h4>{categoryName}</h4>

            <div className="quick-question-list">
              {(showAllQuestions ? questions : questions.slice(0, 4)).map(
                (quickQuestion) => (
                  <button
                    type="button"
                    className="quick-question-button"
                    key={quickQuestion}
                    onClick={() => onQuestionSelect(quickQuestion)}
                    disabled={isLoading}
                  >
                    <span>{quickQuestion}</span>
                    <span className="quick-question-arrow">→</span>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      {questionCategories.length > 3 && (
        <button
          type="button"
          className="explore-questions-button"
          onClick={() => setShowAllQuestions((previous) => !previous)}
        >
          {showAllQuestions
            ? "Show fewer questions ↑"
            : "Explore more questions ↓"}
        </button>
      )}
    </div>
  );
};

export default QuickQuestions;
