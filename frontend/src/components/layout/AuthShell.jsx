import { Link } from "react-router-dom";
import Card from "../ui/Card";

const AuthShell = ({ title, subtitle, icon, children, footer }) => (
    <div className="surface-page min-h-screen px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-md">
            <Card elevated className="p-7 sm:p-9">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-xs)]">
                        {icon}
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
                    {subtitle ? <p className="mt-1.5 text-sm text-[var(--color-text-soft)]">{subtitle}</p> : null}
                </div>
                {children}
                {footer ? <div className="mt-6 text-center text-sm text-[var(--color-text-soft)]">{footer}</div> : null}
            </Card>
            <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
                <Link to="/login" className="focus-ring rounded px-1 py-0.5 text-[var(--color-primary-700)]">
                    DevDesk
                </Link>{" "}
                secure support desk
            </p>
        </div>
    </div>
);

export default AuthShell;
