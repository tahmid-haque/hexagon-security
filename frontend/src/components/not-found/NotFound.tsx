import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

export default function NotFound() {
    return (
        <div className={styles.modal}>
            <div className={styles.sorry}>Sorry!</div>
            <div className={styles.message}>
                The Page you are looking for is unavailable. Return to the home
                page <Link to='/'>here</Link>.
            </div>
        </div>
    );
}
