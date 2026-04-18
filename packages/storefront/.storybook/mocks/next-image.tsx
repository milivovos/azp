import type { ComponentProps } from 'react';

type ImgProps = ComponentProps<'img'> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

/** Упрощённый stub для Storybook (Vite), без оптимизации Next. */
export default function Image({ src, alt, className, fill, style, ...rest }: ImgProps) {
  if (fill) {
    return (
      <img
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
        {...rest}
      />
    );
  }
  return (
    <img
      src={typeof src === 'string' ? src : ''}
      alt={alt ?? ''}
      className={className}
      style={style}
      {...rest}
    />
  );
}
