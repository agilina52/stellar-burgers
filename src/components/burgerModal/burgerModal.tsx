import { useNavigate } from 'react-router-dom';
import { Modal } from '../modal';

export const BurgerModal = ({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };
  return (
    <Modal title={title} onClose={handleClose}>
      {children}
    </Modal>
  );
};
