import { Oval } from "react-loader-spinner";
import "./loadingWidget.css";

function LoadingWidget({ visible, message = "Please wait..." }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-widget">
        <Oval
          height={32}
          width={32}
          color="#ffffff"
          secondaryColor="#666666"
          strokeWidth={3}
          strokeWidthSecondary={3}
          ariaLabel="loading"
        />

        <span className="loading-message">{message}</span>
      </div>
    </div>
  );
}

export default LoadingWidget;
