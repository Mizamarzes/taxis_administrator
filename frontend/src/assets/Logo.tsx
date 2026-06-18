/**
 * @copyright 2025 codewithsadee
 * @license Apache-2.0
 */

/**
 * Types
 */
type Props = {
  variant?: 'default' | 'icon';
  size?: number;
};

export const Logo = ({ variant = 'default', size = 28 }: Props) => {
  if (variant === 'default') {
    return (
      <div
        data-logo='logo'
        className='flex items-center gap-2'
      >
        <img
          src='/favicon.svg'
          alt='Taxis Admin'
          width={size}
          height={size}
        />

        <span className='text-lg font-semibold whitespace-nowrap'>
          Taxis Admin
        </span>
      </div>
    );
  }

  return (
    <img
      src='/favicon.svg'
      alt='Taxis Admin'
      width={size}
      height={size}
    />
  );
};