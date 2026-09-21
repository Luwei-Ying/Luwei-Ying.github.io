(() => {
  "use strict";

  const canvases = document.querySelectorAll("[data-book-trends]");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  const initializeTrends = (canvas) => {
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let isVisible = true;

    const series = [
      {
        label: "Doctrine",
        type: "doctrine",
        color: "#cfbf91",
        dashed: false,
      },
      {
        label: "Desire",
        type: "desire",
        color: "#dbe8e0",
        dashed: true,
      },
    ];

    const valueAt = (trend, x, time, plotWidth) => {
      const position = plotWidth ? x / plotWidth : 0;
      const movement = motionPreference.matches ? 0 : time * 0.00038;
      const primary = Math.sin(position * Math.PI * 2.6 + movement);

      const value =
        trend.type === "doctrine"
          ? 0.5 +
            primary * 0.22 +
            Math.sin(position * Math.PI * 9.2 - movement * 0.64 + 0.35) * 0.055
          : 0.5 -
            primary * 0.22 +
            Math.sin(position * Math.PI * 7.4 + movement * 0.52 + 1.35) * 0.06;

      return height * value;
    };

    const drawGrid = () => {
      context.fillStyle = "#163f35";
      context.fillRect(0, 0, width, height);

      context.save();
      context.strokeStyle = "rgba(244, 241, 234, 0.065)";
      context.lineWidth = 1;

      for (let column = 1; column < 10; column += 1) {
        const x = Math.round((width / 10) * column) + 0.5;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let row = 1; row < 6; row += 1) {
        const y = Math.round((height / 6) * row) + 0.5;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle = "rgba(244, 241, 234, 0.14)";
      context.beginPath();
      context.moveTo(0, Math.round(height / 2) + 0.5);
      context.lineTo(width, Math.round(height / 2) + 0.5);
      context.stroke();
      context.restore();
    };

    const drawTrend = (trend, time, plotWidth) => {
      context.save();
      context.beginPath();

      for (let x = 0; x < plotWidth; x += 3) {
        const y = valueAt(trend, x, time, plotWidth);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.lineTo(plotWidth, valueAt(trend, plotWidth, time, plotWidth));

      context.strokeStyle = trend.color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (trend.dashed) context.setLineDash([8, 7]);
      context.stroke();
      context.restore();
    };

    const drawLabels = (time, plotWidth) => {
      const endpointValues = series.map((trend) => valueAt(trend, plotWidth, time, plotWidth));
      const labelValues = [...endpointValues];
      const minimumGap = 26;

      if (Math.abs(labelValues[0] - labelValues[1]) < minimumGap) {
        const midpoint = (labelValues[0] + labelValues[1]) / 2;
        const doctrineIsHigher = labelValues[0] <= labelValues[1];
        labelValues[0] = midpoint + (doctrineIsHigher ? -minimumGap / 2 : minimumGap / 2);
        labelValues[1] = midpoint + (doctrineIsHigher ? minimumGap / 2 : -minimumGap / 2);
      }

      context.save();
      context.font = `700 ${width < 520 ? 10 : 11}px "SFMono-Regular", Consolas, monospace`;
      context.textBaseline = "middle";

      series.forEach((trend, index) => {
        const lineY = endpointValues[index];
        const labelY = Math.max(14, Math.min(height - 14, labelValues[index]));
        const textX = plotWidth + 13;
        const textWidth = context.measureText(trend.label).width;

        context.fillStyle = "#163f35";
        context.fillRect(textX - 5, labelY - 9, textWidth + 10, 18);

        context.beginPath();
        context.moveTo(plotWidth, lineY);
        context.lineTo(textX - 7, labelY);
        context.strokeStyle = trend.color;
        context.lineWidth = 1.2;
        if (trend.dashed) context.setLineDash([3, 3]);
        context.stroke();
        context.setLineDash([]);

        context.fillStyle = trend.color;
        context.fillText(trend.label, textX, labelY);
      });

      context.restore();
    };

    const draw = (time = 0) => {
      const labelGutter = width < 520 ? 82 : 112;
      const plotWidth = Math.max(1, width - labelGutter);
      drawGrid();
      series.forEach((trend) => drawTrend(trend, time, plotWidth));
      drawLabels(time, plotWidth);
    };

    const animate = (time) => {
      animationFrame = 0;
      draw(time);

      if (isVisible && !document.hidden && !motionPreference.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      if (animationFrame || motionPreference.matches || !isVisible || document.hidden) return;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now());
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) startAnimation();
        else stopAnimation();
      },
      { rootMargin: "120px" }
    );
    visibilityObserver.observe(canvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    });

    motionPreference.addEventListener("change", () => {
      stopAnimation();
      draw(performance.now());
      startAnimation();
    });

    startAnimation();
  };

  canvases.forEach(initializeTrends);
})();
