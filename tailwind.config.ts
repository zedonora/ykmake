import type { Config } from "tailwindcss";

export default {
	darkMode: ["class", "[data-mode='dark']"],
	content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			// 이제 모든 테마 관련 설정은 app/tailwind.css의 @theme 블록에서 관리합니다.
		},
	},
	plugins: [
		// require("tailwindcss-animate") // animate 플러그인은 v4에서 @keyframes로 대체될 수 있으므로 제거 고려
	],
} satisfies Config;