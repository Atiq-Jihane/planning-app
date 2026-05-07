window.Team = function(props) {
    const { equipe, year: initialYear, month: initialMonth, getColor, users } = props;

    const [teamPlanning, setTeamPlanning] = React.useState([]);
    const [tooltip, setTooltip]           = React.useState(null);
    const [year, setYear]                 = React.useState(initialYear);
    const [month, setMonth]               = React.useState(initialMonth);
    const [filterStatus, setFilterStatus] = React.useState("");

    const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    const DAY_LETTERS = ["D","L","M","M","J","V","S"];

    const STATUS_LABELS = {
        P:"Présent", PP:"Permanence", N:"Nuit", TT:"Télétravail", TT2:"½ TT",
        TP:"Déplacement", ZZ:"OFF", Z2:"½ OFF", CX:"Congés", C4:"Congés validés",
        RJ:"RTT validé", R2:"½ RTT", FC:"Férié", FR:"Férié récupéré",
        EF:"Évén. Famille", MA:"Maladie", MT:"Mi-temps thérap.", EM:"Enfant malade",
        FO:"Formation", FJ:"Formation jour", AT:"Accident travail"
    };

    const FILTER_OPTIONS = [
        { code:"",   label:"Tous",        color:"#2962ff" },
        { code:"P",  label:"Présent",     color:"#90caf9" },
        { code:"TT", label:"Télétravail", color:"#2962ff" },
        { code:"CX", label:"Congés",      color:"#00c853" },
        { code:"RJ", label:"RTT",         color:"#ffd600" },
        { code:"FC", label:"Férié",       color:"#d32f2f" },
        { code:"MA", label:"Maladie",     color:"#8e24aa" },
        { code:"ZZ", label:"OFF",         color:"#757575" },
        { code:"FO", label:"Formation",   color:"#fb8c00" },
        { code:"TP", label:"Déplacement", color:"#7986cb" },
    ];

    const AVATAR_COLORS = [
        "#2962ff","#00897b","#e53935","#8e24aa","#fb8c00",
        "#00acc1","#43a047","#d81b60","#6d4c41","#546e7a"
    ];

    React.useEffect(() => {
        if (!equipe) return;

        const API_URL = window.location.origin;

        fetch(`${API_URL}/planning/team?equipe=${equipe}&year=${year}&month=${month}`)
            .then(res => res.json())
            .then(data => setTeamPlanning(data))
            .catch(err => console.error("Erreur team planning:", err));

    }, [equipe, year, month]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    const isWeekend = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00").getDay();
        return d === 0 || d === 6;
    };

    const grouped = teamPlanning.reduce((acc, p) => {
        if (!acc[p.email]) acc[p.email] = [];
        acc[p.email].push(p);
        return acc;
    }, {});

    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
        const day     = i + 1;
        const date    = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayOfWeek = new Date(date + "T00:00:00").getDay();
        return { day, date, weekend: isWeekend(date), isToday: date === today, letter: DAY_LETTERS[dayOfWeek] };
    });

    const getInitials = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const todayStr = today;
    const emailList = Object.keys(grouped).filter(email => {
        if (!filterStatus) return true;
        const days = grouped[email];
        const todayEntry = days.find(d => d.date === todayStr);
        return todayEntry?.status === filterStatus;
    });

    const activeFilter = FILTER_OPTIONS.find(f => f.code === filterStatus);

    return (
        <div style={{ padding:"20px 30px", position:"relative" }}>

            {/* HEADER */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
                <div>
                    <h2 style={{ margin:0 }}>👥 Planning équipe — {MONTHS[month-1]} {year}</h2>
                    <p style={{ color:"#888", fontSize:"13px", margin:"4px 0 0" }}>
                        Vue mensuelle · équipe <strong>{equipe}</strong> · {Object.keys(grouped).length} membre{Object.keys(grouped).length > 1 ? "s" : ""}
                        {filterStatus && <span style={{ marginLeft:"8px", color:activeFilter?.color, fontWeight:"bold" }}>
                            · filtre : {activeFilter?.label}
                        </span>}
                    </p>
                </div>

                {/* Sélecteur mois / année */}
                <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                            style={{ padding:"8px 12px", borderRadius:"8px", border:"2px solid #ccc", fontSize:"14px", cursor:"pointer" }}>
                        {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                            style={{ padding:"8px 12px", borderRadius:"8px", border:"2px solid #ccc", fontSize:"14px", cursor:"pointer" }}>
                        {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* FILTRE PAR STATUT */}
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px", alignItems:"center" }}>
                <span style={{ fontSize:"13px", color:"#666", fontWeight:"600" }}>Filtrer aujourd'hui :</span>
                {FILTER_OPTIONS.map(opt => (
                    <button
                        key={opt.code}
                        onClick={() => setFilterStatus(opt.code === filterStatus ? "" : opt.code)}
                        style={{
                            padding:"5px 14px",
                            borderRadius:"20px",
                            border: filterStatus === opt.code ? `2px solid ${opt.color}` : "2px solid #e0e0e0",
                            background: filterStatus === opt.code ? opt.color : "white",
                            color: filterStatus === opt.code ? (opt.code === "RJ" || opt.code === "" ? "#333" : "white") : "#555",
                            fontSize:"12px",
                            fontWeight:"bold",
                            cursor:"pointer",
                            transition:"0.2s",
                            boxShadow: filterStatus === opt.code ? `0 2px 8px ${opt.color}55` : "none"
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {emailList.length === 0 ? (
                <div style={{
                    background:"white", borderRadius:"12px", padding:"40px",
                    textAlign:"center", color:"#aaa", boxShadow:"0 2px 8px rgba(0,0,0,0.06)"
                }}>
                    {filterStatus
                        ? `Aucun membre avec le statut "${activeFilter?.label}" aujourd'hui.`
                        : "Aucune donnée disponible pour cette période."
                    }
                </div>
            ) : (
                <div style={{ overflowX:"auto" }}>
                    <table style={{
                        borderCollapse:"collapse", width:"100%", background:"white",
                        borderRadius:"16px", overflow:"hidden",
                        boxShadow:"0 4px 16px rgba(0,0,0,0.08)"
                    }}>
                        <thead>
                        <tr>
                            <th style={{
                                background:"#2962ff", color:"white", padding:"10px 16px",
                                textAlign:"left", fontSize:"13px", minWidth:"180px",
                                position:"sticky", left:0, zIndex:2
                            }}>Membre</th>

                            {dayHeaders.map(({ day, letter, weekend, isToday }) => (
                                <th key={day} style={{
                                    background: isToday ? "#1a237e" : weekend ? "#5c35d6" : "#2962ff",
                                    color: isToday ? "#ffd600" : "white",
                                    padding:"6px 2px",
                                    fontSize:"10px",
                                    minWidth:"34px",
                                    textAlign:"center",
                                    borderBottom: isToday ? "3px solid #ffd600" : "none",
                                    fontWeight: isToday ? "800" : weekend ? "400" : "600"
                                }}>
                                    <div style={{ fontSize:"9px", opacity: isToday ? 1 : 0.75, marginBottom:"2px" }}>
                                        {letter}
                                    </div>
                                    <div style={{ fontSize:"11px", fontWeight: isToday ? "900" : "600" }}>
                                        {day}
                                    </div>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {emailList.map((email, rowIdx) => {
                            const user = users ? users.find(u => u.email === email) : null;
                            const displayName = user ? `${user.prenom} ${user.nom}` : email;
                            const initials    = getInitials(displayName);
                            const avatarColor = AVATAR_COLORS[rowIdx % AVATAR_COLORS.length];
                            const days        = grouped[email];
                            const rowBg       = rowIdx % 2 === 0 ? "white" : "#fafbff";

                            return (
                                <tr key={email} style={{ background:rowBg }}>
                                    {/* Avatar + Nom */}
                                    <td style={{
                                        padding:"8px 12px", borderBottom:"1px solid #f0f0f0",
                                        position:"sticky", left:0, background:rowBg, zIndex:1
                                    }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                                            <div style={{
                                                width:"32px", height:"32px", borderRadius:"50%",
                                                background:avatarColor, color:"white",
                                                display:"flex", alignItems:"center", justifyContent:"center",
                                                fontSize:"11px", fontWeight:"bold", flexShrink:0
                                            }}>
                                                {initials}
                                            </div>
                                            <span style={{ fontWeight:"600", fontSize:"13px", color:"#333", whiteSpace:"nowrap" }}>
                                                    {displayName}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Cases jours */}
                                    {dayHeaders.map(({ day, date, weekend, isToday }) => {
                                        const entry  = days.find(d => d.date === date);
                                        const status = entry?.status || "";
                                        const bg     = getColor(status) || (weekend ? "#ede7f6" : "#f5f7fa");
                                        const isLight = !status || status === "RJ" || status === "R2";
                                        const label  = STATUS_LABELS[status] || "";

                                        return (
                                            <td key={date} style={{
                                                padding:"4px 2px",
                                                textAlign:"center",
                                                borderBottom:"1px solid #f0f0f0",
                                                borderLeft:"1px solid #f5f5f5",
                                                background: isToday ? "#fffde7" : "transparent",
                                                outline: isToday ? "2px solid #ffd600" : "none",
                                                outlineOffset:"-2px"
                                            }}>
                                                <div
                                                    onMouseEnter={e => {
                                                        if (!status) return;
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setTooltip({
                                                            x: rect.left,
                                                            y: rect.top - 36,
                                                            text: `${status} — ${label}`
                                                        });
                                                    }}
                                                    onMouseLeave={() => setTooltip(null)}
                                                    style={{
                                                        width:"28px", height:"28px",
                                                        fontSize:"9px", borderRadius:"5px",
                                                        background:bg,
                                                        display:"flex", alignItems:"center", justifyContent:"center",
                                                        color: isLight ? "#555" : "white",
                                                        fontWeight: isToday ? "900" : "bold",
                                                        margin:"0 auto",
                                                        boxShadow: isToday && status ? "0 0 0 2px #ffd600" : "none",
                                                        cursor:"default"
                                                    }}
                                                >
                                                    {weekend && !status ? "🌙" : status}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TOOLTIP */}
            {tooltip && (
                <div style={{
                    position:"fixed", left:tooltip.x, top:tooltip.y,
                    background:"#1a237e", color:"white",
                    padding:"5px 12px", borderRadius:"8px",
                    fontSize:"12px", fontWeight:"bold",
                    pointerEvents:"none", zIndex:9999,
                    whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.3)"
                }}>
                    {tooltip.text}
                </div>
            )}

            {/* LÉGENDE */}
            <div style={{ marginTop:"20px", display:"flex", flexWrap:"wrap", gap:"10px", fontSize:"12px" }}>
                {[
                    { code:"P",  label:"Présent",     color:"#90caf9" },
                    { code:"TT", label:"Télétravail",  color:"#2962ff" },
                    { code:"CX", label:"Congés",       color:"#00c853" },
                    { code:"RJ", label:"RTT",          color:"#ffd600" },
                    { code:"FC", label:"Férié",        color:"#d32f2f" },
                    { code:"MA", label:"Maladie",      color:"#8e24aa" },
                    { code:"ZZ", label:"OFF",          color:"#757575" },
                    { code:"FO", label:"Formation",    color:"#fb8c00" },
                    { code:"TP", label:"Déplacement",  color:"#7986cb" },
                ].map(item => (
                    <div key={item.code} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                        <div style={{
                            width:"14px", height:"14px", borderRadius:"3px",
                            background:item.color, flexShrink:0
                        }}/>
                        <span style={{ color:"#555" }}>{item.code} — {item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};