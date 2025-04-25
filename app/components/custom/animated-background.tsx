import React, { useRef, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const grid = useRef<{ x: number; y: number; color: string }[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 100; // 밀리초 단위 (0.1초마다 업데이트)
  const pixelSize = 6; // 픽셀 크기 줄임 (10 -> 6)
  const baseColor = '#18181b'; // 기본 배경색 (zinc-900)
  const activeColor = '#e11d48'; // 활성 픽셀 색상 변경 (rose-500 -> rose-600)

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    let container: HTMLElement | null = null;

    if (!canvas || !context) {
      return;
    }

    const resizeCanvas = () => {
      container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        initializeGrid();
        drawGrid(performance.now()); // Resize 후 즉시 다시 그리기
      }
    };

    const initializeGrid = () => {
      grid.current = [];
      const cols = Math.ceil(canvas.width / pixelSize);
      const rows = Math.ceil(canvas.height / pixelSize);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          grid.current.push({
            x: i * pixelSize,
            y: j * pixelSize,
            color: baseColor,
          });
        }
      }
    };

    const drawGrid = (timestamp: number) => {
      // Clear canvas
      context.fillStyle = baseColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Update colors periodically
      if (timestamp - lastUpdateTime.current > updateInterval) {
        lastUpdateTime.current = timestamp;
        // Randomly change some pixels to active color and some back to base color
        const pixelsToActivate = Math.floor(grid.current.length * 0.01); // 1% 활성화
        const pixelsToDeactivate = Math.floor(grid.current.length * 0.01); // 1% 비활성화

        for (let i = 0; i < pixelsToActivate; i++) {
          const randomIndex = Math.floor(Math.random() * grid.current.length);
          grid.current[randomIndex].color = activeColor;
        }
        for (let i = 0; i < pixelsToDeactivate; i++) {
          const randomIndex = Math.floor(Math.random() * grid.current.length);
          if (grid.current[randomIndex].color === activeColor) {
            grid.current[randomIndex].color = baseColor;
          }
        }
      }

      // Draw pixels
      grid.current.forEach(pixel => {
        context.fillStyle = pixel.color;
        // 작은 틈을 위해 pixelSize보다 약간 작게 그립니다.
        context.fillRect(pixel.x + 1, pixel.y + 1, pixelSize - 2, pixelSize - 2);
      });

      animationFrameId.current = requestAnimationFrame(drawGrid);
    };

    resizeCanvas(); // Initial setup
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animationFrameId.current = requestAnimationFrame(drawGrid);

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [baseColor, activeColor, pixelSize, updateInterval]); // 의존성 배열 추가

  return (
    <div className="w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="pointer-events-none w-full h-full" />
    </div>
  );
};

export default AnimatedBackground; 