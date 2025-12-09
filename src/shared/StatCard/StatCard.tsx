import styles from './StatCard.module.css';
import { FaUser, FaBell, FaBriefcase, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaCalendarAlt } from 'react-icons/fa';


type Props = {
    title: string;
    count: number;
    change: number;
    chartData: { value: number }[];
    icon: 'user' | 'bell' | 'briefcase';
    showCalendar?: boolean;
};

const icons = {
    user: <FaUser />,
    bell: <FaBell />,
    briefcase: <FaBriefcase />,
};

const StatCard = ({ title, count, change, chartData, icon,showCalendar }: Props) => {
    const isNegative = change < 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {icons[icon]}
                    <span>{title}</span>
                </div>
                {showCalendar && <FaCalendarAlt className={styles.calendarIcon} />}
            </div>
            {/* <div className={styles.content}>
        <h3>{count}</h3>
        <p className={isNegative ? styles.down : styles.up}>
          {isNegative ? '↓' : '↑'} {Math.abs(change)}
        </p>
      </div>
      <p className={styles.subtext}>VS LAST WEEK</p> */}

            <div className={styles.metricRow}>
                <h3>{count}</h3>
                <div className={styles.metricRight}>
                    <span className={isNegative ? styles.down : styles.up}>
                        {isNegative ? <FaArrowDown /> : <FaArrowUp />} {Math.abs(change)}
                    </span>
                    <p className={styles.subtext}>VS LAST WEEK</p>
                </div>
            </div>

            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={chartData}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#346967" barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatCard;
