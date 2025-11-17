import { FC, memo } from 'react';

import styles from './modal.module.css';

import { CloseIcon } from '@zlden/react-developer-burger-ui-components';
import { TModalUIProps } from './type';
import { ModalOverlayUI } from '@ui';

// добавлен тип
export const ModalUI: FC<TModalUIProps & { 'data-testid'?: string }> = memo(
  ({ title, onClose, children, 'data-testid': dataTestId }) => (
    <>
      <div
        className={styles.modal}
        //data-атрибут для модалки
        data-testid={dataTestId}
      >
        <div className={styles.header}>
          <h3 className={`${styles.title} text text_type_main-large`}>
            {title}
          </h3>
          <button
            className={styles.button}
            type='button'
            // data-атрибут для кнопки закрытия
            data-testid='modal-close-button'
          >
            <CloseIcon type='primary' onClick={onClose} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <ModalOverlayUI onClick={onClose} />
    </>
  )
);
