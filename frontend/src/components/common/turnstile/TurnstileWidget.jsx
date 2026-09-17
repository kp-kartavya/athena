import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Provides a reusable Cloudflare Turnstile widget.
 *
 * The widget is created once and reused for the lifetime of the component.
 * The parent can reset the widget through the exposed reset() method.
 */
const TurnstileWidget = forwardRef(
  ({ enabled, theme, onToken, onError }, ref) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const onTokenRef = useRef(onToken);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onTokenRef.current = onToken;
      onErrorRef.current = onError;
    }, [onToken, onError]);

    useImperativeHandle(ref, () => ({
      reset() {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.reset(widgetIdRef.current);
        }

        onTokenRef.current?.("");
      },
    }));

    useEffect(() => {
      if (!enabled || widgetIdRef.current !== null) {
        return;
      }

      let cancelled = false;
      let intervalId = null;

      const renderWidget = () => {
        if (
          cancelled ||
          !window.turnstile ||
          !containerRef.current ||
          widgetIdRef.current !== null
        ) {
          return;
        }

        window.turnstile.ready(() => {
          if (
            cancelled ||
            !window.turnstile ||
            !containerRef.current ||
            widgetIdRef.current !== null
          ) {
            return;
          }

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,

            theme,

            callback: (token) => {
              onTokenRef.current?.(token);
            },

            "expired-callback": () => {
              onTokenRef.current?.("");
            },

            "error-callback": () => {
              onTokenRef.current?.("");
              onErrorRef.current?.(
                "Security verification failed. Please try again.",
              );
            },
          });
        });
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        intervalId = window.setInterval(() => {
          if (window.turnstile) {
            window.clearInterval(intervalId);
            renderWidget();
          }
        }, 100);
      }

      return () => {
        cancelled = true;

        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
      };
    }, [enabled, theme]);

    useEffect(() => {
      return () => {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);

          widgetIdRef.current = null;
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="turnstile-widget"
        style={{
          display: enabled ? "flex" : "none",
          justifyContent: "center",
        }}
      />
    );
  },
);

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
