import React, { FC, memo } from 'react';
import styles from './burger-constructor-element.module.css';
import { ConstructorElement } from '@zlden/react-developer-burger-ui-components';
import { BurgerConstructorElementUIProps } from './type';
import { MoveButton } from '@zlden/react-developer-burger-ui-components';

// добавляем тип & { 'data-testid'?: string }
export const BurgerConstructorElementUI: FC<
  BurgerConstructorElementUIProps & { 'data-testid'?: string }
> = memo(
  ({
    ingredient,
    index,
    totalItems,
    handleMoveUp,
    handleMoveDown,
    handleClose,
    'data-testid': dataTestId // ← получить из пропсов
  }) => (
    <li
      className={`${styles.element} mb-4 mr-2`}
      data-testid={dataTestId} // ← используем полученный data-testid
    >
      <MoveButton
        handleMoveDown={handleMoveDown}
        handleMoveUp={handleMoveUp}
        isUpDisabled={index === 0}
        isDownDisabled={index === totalItems - 1}
      />
      <div className={`${styles.element_fullwidth} ml-2`}>
        <ConstructorElement
          text={ingredient.name}
          price={ingredient.price}
          thumbnail={ingredient.image}
          handleClose={handleClose}
        />
      </div>
    </li>
  )
);
