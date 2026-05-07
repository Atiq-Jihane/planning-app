// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    "#2563eb","#00897b","#e53935","#8e24aa","#fb8c00",
    "#00acc1","#43a047","#d81b60","#6d4c41","#546e7a"
];

function getInitials(prenom, nom) {
    return ((prenom?.[0] || "") + (nom?.[0] || "")).toUpperCase();
}
function avatarColor(index) {
    return AVATAR_COLORS[Math.abs(index) % AVATAR_COLORS.length];
}

// ─── HOOK COMPTEUR ANIMÉ ─────────────────────────────────────────────────────
function useAnimatedCount(target) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        if (target === 0) { setCount(0); return; }
        let current = 0;
        const step = Math.ceil(target / 18);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(current);
        }, 28);
        return () => clearInterval(timer);
    }, [target]);
    return count;
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ eq, isActive, onClick }) {
    const animated = useAnimatedCount(eq.count);
    return (
        <div
            className={`stat-card ${isActive ? "active" : ""}`}
            style={{ borderTopColor: eq.color }}
            onClick={onClick}
        >
            <div className="stat-card-num" style={{ color: eq.color }}>{animated}</div>
            <div className="stat-card-info">
                <span className="stat-card-label">{eq.nom}</span>
                <span className="stat-card-sub">membre{eq.count > 1 ? "s" : ""}</span>
            </div>
        </div>
    );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
    return (
        <div className="toast-wrap">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type}`}>
                    <span style={{ fontSize:"18px" }}>{t.type === "success" ? "✅" : "❌"}</span>
                    <span>{t.msg}</span>
                    <div className="toast-progress" />
                </div>
            ))}
        </div>
    );
}

// ─── MODAL SUPPRESSION ───────────────────────────────────────────────────────
function DeleteModal({ user, equipesDispo, onConfirm, onCancel }) {
    const idx = equipesDispo.indexOf(user?.equipe);
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">🗑️</div>
                <h3>Supprimer cet utilisateur ?</h3>
                <p>Cette action est irréversible.</p>
                <div className="modal-user">
                    <div className="avatar" style={{ background: avatarColor(idx) }}>
                        {getInitials(user.prenom, user.nom)}
                    </div>
                    <div>
                        <div style={{ fontWeight:"700", color:"#e2e8f0", fontSize:"14px" }}>
                            {user.prenom} {user.nom}
                        </div>
                        <div style={{ fontSize:"12px", color:"#64748b" }}>{user.email}</div>
                        <div style={{ marginTop:"4px" }}>
                            <span className="pill" style={{ background: avatarColor(idx), fontSize:"10px", padding:"2px 8px" }}>
                                {user.equipe}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Annuler</button>
                    <button className="btn-confirm-delete" onClick={onConfirm}>Supprimer</button>
                </div>
            </div>
        </div>
    );
}

// ─── DRAWER FORMULAIRE ───────────────────────────────────────────────────────
function Drawer({ open, onClose, onAdd, users, equipesDispo }) {
    const [prenom,       setPrenom]       = React.useState("");
    const [nom,          setNom]          = React.useState("");
    const [email,        setEmail]        = React.useState("");
    const [equipe,       setEquipe]       = React.useState("");
    const [equipeCustom, setEquipeCustom] = React.useState("");
    const [loading,      setLoading]      = React.useState(false);
    const [error,        setError]        = React.useState("");
    const [closing,      setClosing]      = React.useState(false);

    const equipeFinale = equipe === "__custom__" ? equipeCustom : equipe;
    const canAdd = prenom && nom && email && equipeFinale;

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => { setClosing(false); onClose(); }, 220);
    };

    React.useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open]);

    React.useEffect(() => {
        if (open) {
            setPrenom(""); setNom(""); setEmail("");
            setEquipe(""); setEquipeCustom(""); setError("");
        }
    }, [open]);

    const handleSubmit = () => {
        setError("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Adresse email invalide."); return;
        }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            setError("Cet email est déjà utilisé."); return;
        }
        setLoading(true);
        fetch("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prenom, nom, email, equipe: equipeFinale })
        })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => {
                onAdd(`${prenom} ${nom} ajouté(e) avec succès !`);
                handleClose();
            })
            .catch(() => setError("Erreur lors de l'ajout. Vérifiez le serveur."))
            .finally(() => setLoading(false));
    };

    if (!open && !closing) return null;

    return (
        <>
            <div className="drawer-overlay" onClick={handleClose} />
            <div className={`drawer ${closing ? "drawer-closing" : ""}`}>
                <div className="drawer-header">
                    <div>
                        <div className="drawer-title">➕ Nouvel utilisateur</div>
                        <div style={{ fontSize:"12px", color:"#64748b", marginTop:"2px" }}>
                            Remplissez les informations ci-dessous
                        </div>
                    </div>
                    <button className="drawer-close" onClick={handleClose}>✕</button>
                </div>

                <div className="drawer-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Prénom *</label>
                            <input type="text" placeholder="Marie" value={prenom}
                                   onChange={e => setPrenom(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input type="text" placeholder="Dupont" value={nom}
                                   onChange={e => setNom(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" placeholder="marie.dupont@disney.com"
                               value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Équipe *</label>
                        <select value={equipe} onChange={e => setEquipe(e.target.value)}>
                            <option value="">— Choisir une équipe —</option>
                            {equipesDispo.map(eq => (
                                <option key={eq} value={eq}>{eq}</option>
                            ))}
                            <option value="__custom__">✏️ Nouvelle équipe…</option>
                        </select>
                    </div>

                    {equipe === "__custom__" && (
                        <div className="form-group">
                            <label>Nom de la nouvelle équipe *</label>
                            <input type="text" placeholder="Ex : Comptabilité"
                                   value={equipeCustom} onChange={e => setEquipeCustom(e.target.value)} autoFocus />
                        </div>
                    )}

                    {error && <div className="error-msg">⚠ {error}</div>}

                    {(prenom || nom) && (
                        <div className="preview-card">
                            <div className="avatar" style={{
                                background: avatarColor(equipesDispo.indexOf(equipeFinale)),
                                width:"30px", height:"30px", fontSize:"11px"
                            }}>
                                {getInitials(prenom, nom)}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:"13px", fontWeight:"700", color:"#e2e8f0" }}>
                                    {prenom || "…"} {nom || ""}
                                </div>
                                {email && <div style={{ fontSize:"11px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email}</div>}
                            </div>
                            {equipeFinale && (
                                <span className="pill" style={{
                                    background: avatarColor(equipesDispo.indexOf(equipeFinale)),
                                    fontSize:"10px", padding:"2px 8px", flexShrink:0
                                }}>
                                    {equipeFinale}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="drawer-footer">
                    <button className="btn-drawer-submit" onClick={handleSubmit} disabled={!canAdd || loading}>
                        {loading ? "⏳ Ajout en cours…" : "➕ Ajouter l'utilisateur"}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
// L'auth se fait via POST /api/auth/login avec l'email uniquement.
// ─────────────────────────────────────────────────────────────────────────────
function AdminApp() {
    const [session,    setSession]    = React.useState(null);
    const [checking,   setChecking]   = React.useState(true);
    const [loginEmail, setLoginEmail] = React.useState("");
    const [loginErr,   setLoginErr]   = React.useState("");
    const [shake,      setShake]      = React.useState(false);
    const [loading,    setLoading]    = React.useState(false);

    // ── Vérifier si une session existe déjà (rechargement de page) ──
    React.useEffect(() => {
        fetch("/api/auth/me", { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.role === "ADMIN") setSession(data);
            })
            .finally(() => setChecking(false));
    }, []);

    const handleLogin = () => {
        setLoginErr("");
        setLoading(true);
        fetch("/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail })  // ← email uniquement, comme team.html
        })
            .then(r => r.json().then(data => ({ ok: r.ok, data })))
            .then(({ ok, data }) => {
                if (ok && data.role === "ADMIN") {
                    setSession(data);
                } else if (ok && data.role !== "ADMIN") {
                    setLoginErr("Accès refusé : vous n'êtes pas administrateur.");
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                } else {
                    setLoginErr(data.error || "Email introuvable.");
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                }
            })
            .catch(() => {
                setLoginErr("Erreur réseau, vérifiez le serveur.");
                setShake(true);
                setTimeout(() => setShake(false), 500);
            })
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        fetch("/api/auth/logout", { method: "POST", credentials: "include" })
            .finally(() => {
                setSession(null);
                setLoginEmail("");
            });
    };

    // ── Chargement initial ──
    if (checking) {
        return (
            <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#475569" }}>
                Chargement…
            </div>
        );
    }

    // ── Formulaire de connexion ──
    if (!session) {
        return (
            <div className="login-wrap">
                <style>{`@keyframes shake {
                    10%,90%{transform:translateX(-3px)}
                    20%,80%{transform:translateX(5px)}
                    30%,50%,70%{transform:translateX(-6px)}
                    40%,60%{transform:translateX(6px)}
                }`}</style>
                <div className="login-card" style={{ animation: shake ? "shake 0.4s both" : undefined }}>
                    <div className="login-icon">🔐</div>
                    <h1>Administration</h1>
                    <p>Accès réservé aux administrateurs</p>

                    <div className="input-group">
                        <label>Email administrateur</label>
                        <input
                            type="email"
                            placeholder="votre.email@disney.com"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLogin()}
                            autoFocus
                        />
                    </div>

                    {loginErr && <div className="error-msg">⚠ {loginErr}</div>}

                    <button className="btn-primary" onClick={handleLogin}
                            disabled={!loginEmail || loading}>
                        {loading ? "⏳ Connexion…" : "Se connecter →"}
                    </button>

                    <div style={{ textAlign:"center" }}>
                        <a href="react.html" style={{ color:"#475569", fontSize:"13px", textDecoration:"none" }}>
                            ← Retour au planning
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // ── Dashboard admin ──
    return (
        <div>
            <div className="topbar">
                <div className="topbar-brand">
                    <span>📋 Planning App</span>
                    <span className="topbar-badge">Admin</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
    <span style={{ fontSize:"13px", color:"#64748b" }}>
        👤 {session.prenom} {session.nom}
    </span>
                    <a href="react.html" style={{ color:"#64748b", fontSize:"13px", textDecoration:"none" }}>
                        ← Planning
                    </a>
                </div>
            </div>
            <AdminDashboard />
        </div>
    );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function AdminDashboard() {
    const [users,        setUsers]        = React.useState([]);
    const [toasts,       setToasts]       = React.useState([]);
    const [search,       setSearch]       = React.useState("");
    const [activeEquipe, setActiveEquipe] = React.useState("Tous");
    const [deleteTarget, setDeleteTarget] = React.useState(null);
    const [drawerOpen,   setDrawerOpen]   = React.useState(false);

    const loadUsers = () => {
        fetch("/users")
            .then(r => r.json())
            .then(setUsers)
            .catch(() => showToast("error", "Impossible de charger les utilisateurs."));
    };
    React.useEffect(() => { loadUsers(); }, []);

    const showToast = (type, msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    const equipesDispo = React.useMemo(() =>
            [...new Set(users.map(u => u.equipe).filter(Boolean))].sort()
        , [users]);

    const statEquipes = equipesDispo.map((eq, i) => ({
        nom: eq, count: users.filter(u => u.equipe === eq).length, color: avatarColor(i)
    }));

    const allEquipes = ["Tous", ...equipesDispo];

    const filteredUsers = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${u.prenom} ${u.nom} ${u.email} ${u.equipe}`.toLowerCase().includes(q);
        const matchEquipe = activeEquipe === "Tous" || u.equipe === activeEquipe;
        return matchSearch && matchEquipe;
    });

    const confirmDelete = () => {
        const user = deleteTarget;
        setDeleteTarget(null);
        fetch(`/users/${encodeURIComponent(user.email)}`, { method: "DELETE" })
            .then(r => { if (!r.ok) throw new Error(); })
            .then(() => { showToast("success", `${user.prenom} ${user.nom} supprimé(e).`); loadUsers(); })
            .catch(() => showToast("error", "Erreur lors de la suppression."));
    };

    const totalCount = useAnimatedCount(users.length);

    return (
        <div className="page">

            {deleteTarget && (
                <DeleteModal
                    user={deleteTarget}
                    equipesDispo={equipesDispo}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onAdd={(msg) => { showToast("success", msg); loadUsers(); }}
                users={users}
                equipesDispo={equipesDispo}
            />

            <ToastContainer toasts={toasts} />

            <div className="page-header">
                <div className="page-title">
                    🛠 Gestion des utilisateurs
                    <span style={{
                        background:"linear-gradient(135deg,#60a5fa,#a78bfa)",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
                    }}>{totalCount}</span>
                </div>
                <p className="page-sub">
                    {users.length} utilisateur{users.length > 1 ? "s" : ""} · {equipesDispo.length} équipe{equipesDispo.length > 1 ? "s" : ""}
                </p>
            </div>

            <div className="stat-bar">
                {statEquipes.map((eq) => (
                    <StatCard
                        key={eq.nom}
                        eq={eq}
                        isActive={activeEquipe === eq.nom}
                        onClick={() => setActiveEquipe(activeEquipe === eq.nom ? "Tous" : eq.nom)}
                    />
                ))}
                <div style={{ flex:1 }} />
                <button className="btn-open-drawer" onClick={() => setDrawerOpen(true)}>
                    <span style={{ fontSize:"16px" }}>➕</span>
                    Ajouter un utilisateur
                </button>
            </div>

            <div className="card">
                <div className="card-title" style={{ justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center" }}>
                        👥 Utilisateurs
                        <span className="count-badge">{filteredUsers.length}</span>
                    </div>
                </div>

                <div className="toolbar">
                    {allEquipes.map((eq, i) => {
                        const isAct = activeEquipe === eq;
                        const col   = i === 0 ? "#3b82f6" : avatarColor(i - 1);
                        return (
                            <button key={eq} className="filter-tab"
                                    onClick={() => setActiveEquipe(eq)}
                                    style={{
                                        border: `2px solid ${isAct ? col : "rgba(255,255,255,0.08)"}`,
                                        background: isAct ? col : "transparent",
                                        color: isAct ? "white" : "#64748b",
                                        boxShadow: isAct ? `0 0 16px ${col}44` : "none"
                                    }}
                            >
                                {eq}
                                {i > 0 && (
                                    <span style={{
                                        marginLeft:"6px", fontSize:"10px",
                                        background: isAct ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                                        padding:"1px 6px", borderRadius:"10px"
                                    }}>
                                        {users.filter(u => u.equipe === eq).length}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <input className="user-search"
                           placeholder="🔍 Rechercher par nom, email, équipe…"
                           value={search}
                           onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize:"36px", opacity:0.3, marginBottom:"12px" }}>👤</div>
                        {search ? "Aucun résultat pour cette recherche." : "Aucun utilisateur dans cette équipe."}
                    </div>
                ) : (
                    <div style={{ overflowX:"auto" }}>
                        <table className="user-table">
                            <thead>
                            <tr>
                                <th>Membre</th>
                                <th>Email</th>
                                <th>Équipe</th>
                                <th>Rôle</th>
                                <th style={{ textAlign:"right" }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((u, i) => {
                                const eqIdx = equipesDispo.indexOf(u.equipe);
                                return (
                                    <tr key={u.email} style={{ animationDelay:`${i * 0.035}s` }}>
                                        <td>
                                            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                                                <div className="avatar" style={{ background: avatarColor(eqIdx >= 0 ? eqIdx : i) }}>
                                                    {getInitials(u.prenom, u.nom)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight:"700", color:"#e2e8f0" }}>
                                                        {u.prenom} {u.nom}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color:"#475569", fontSize:"12px" }}>{u.email}</td>
                                        <td>
                                            <span className="pill" style={{ background: avatarColor(eqIdx >= 0 ? eqIdx : i) }}>
                                                {u.equipe}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="pill" style={{
                                                background: u.role === "ADMIN" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(255,255,255,0.08)",
                                                color: u.role === "ADMIN" ? "white" : "#64748b",
                                                fontSize:"10px"
                                            }}>
                                                {u.role || "USER"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign:"right" }}>
                                            <button className="btn-delete" onClick={() => setDeleteTarget(u)}>
                                                🗑 Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── MONTAGE ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);