import { Link } from "react-router-dom";
import Card from "../ui/Card";

const AuthShell = ({ title, subtitle, icon, children, footer }) => (
    <div className="surface-page flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fcfdfef0]">
        <div className="mx-auto w-full max-w-lg mb-8 text-center">
            <Link to="/login" className="focus-ring inline-block rounded-[var(--radius-sm)]">
                <span className="text-xl font-extrabold tracking-tight text-[var(--color-primary-700)]">Dev<span className="text-[var(--color-text)]">Desk</span></span>
            </Link>
        </div>
        <div className="mx-auto w-full max-w-[440px]">
            <Card className="px-8 py-10 shadow-xl border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-[var(--color-surface)]">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] shadow-sm">
                        {icon}
                    </div>
                    <h1 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">{title}</h1>
                    {subtitle ? <p className="mt-2 text-[14px] font-medium text-[var(--color-text-soft)]">{subtitle}</p> : null}
                </div>
                {children}
                {footer ? <div className="mt-8 text-center text-[13px] font-semibold text-[var(--color-text-soft)]">{footer}</div> : null}
            </Card>
        </div>
    </div>
);

export default AuthShell;
