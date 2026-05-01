import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const HeartIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
  </Svg>
);

export const BookIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Path d="M4 5h7v15H6a2 2 0 0 1-2-2zM20 5h-7v15h5a2 2 0 0 0 2-2z" />
  </Svg>
);

export const MailIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Rect x={3} y={5} width={18} height={14} rx={2} />
    <Path d="M3 7l9 6 9-6" />
  </Svg>
);

export const CalendarIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Rect x={3} y={5} width={18} height={16} rx={2} />
    <Path d="M3 9h18M8 3v4M16 3v4" />
  </Svg>
);

export const PersonIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);

export const CameraIcon = ({ size = 42, color = '#37928b' }: Props) => (
  <Svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth={1.5}>
    <Rect x={4} y={11} width={40} height={30} rx={3} />
    <Circle cx={24} cy={26} r={8} />
    <Circle cx={24} cy={26} r={3} fill={color} stroke="none" />
    <Path d="M16 11l3-5h10l3 5" />
  </Svg>
);

export const MicIcon = ({ size = 22, color = '#ffffff' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.8}>
    <Rect x={9} y={3} width={6} height={12} rx={3} />
    <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Svg>
);

export const ArrowRightIcon = ({ size = 18, color = '#ffffff' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const CheckIcon = ({ size = 14, color = '#ffffff' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={3}>
    <Path d="M5 12l5 5 9-12" />
  </Svg>
);

export const QrIcon = ({ size = 18, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
    <Rect x={3} y={3} width={7} height={7} />
    <Rect x={14} y={3} width={7} height={7} />
    <Rect x={3} y={14} width={7} height={7} />
    <Path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
  </Svg>
);

export const CloseIcon = ({ size = 20, color = '#2e4447' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const RetakeIcon = ({ size = 16, color = '#ffffff' }: Props) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 12a9 9 0 1 0 3-6.7" />
    <Path d="M3 4v5h5" />
  </Svg>
);
