declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;
  
  export const Mic: Icon;
  export const MicOff: Icon;
  export const ArrowLeft: Icon;
  export const Loader2: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Search: Icon;
  export const User: Icon;
  export const Settings: Icon;
  export const LogOut: Icon;
  export const Plus: Icon;
  export const Trash2: Icon;
  export const Edit: Icon;
  export const Check: Icon;
  export const X: Icon;
  export const Upload: Icon;
  export const Image: Icon;
  export const CheckCircle2: Icon;
  export const Play: Icon;
  export const BookOpen: Icon;
  export const Home: Icon;
  export const Book: Icon;
  export const Menu: Icon;
  export const Filter: Icon;
  export const Info: Icon;
  export const AlertCircle: Icon;
  export const Download: Icon;
  export const Copy: Icon;
  export const ExternalLink: Icon;
}
