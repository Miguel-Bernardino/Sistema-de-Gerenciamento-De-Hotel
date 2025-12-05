import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveToken, saveUser } from "~/utils/auth";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/auth/login`;
      
      console.log('📡 Enviando login para:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      
      console.log('✅ Resposta do servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        setError(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        return;
      }
      
      const result = await response.json();
      console.log('🔐 Resultado do login:', result);
      
      // Backend retorna: { admin: {...}, token: "..." }
      if (result.token && result.admin) {
        // Salvar token
        saveToken(result.token);
        console.log('✅ Token salvo:', result.token.substring(0, 20) + '...');
        
        // Salvar dados do usuário
        saveUser({
          id: result.admin.id,
          email: result.admin.email,
          name: result.admin.name
        });
        console.log('👤 Dados do usuário salvos:', result.admin.email);
        
        navigate('/home');
      } else if (result.success && result.token) {
        // Fallback para formato antigo
        if (result.token) {
          saveToken(result.token);
        }
        
        if (result.data?.user || result.user) {
          saveUser(result.data?.user || result.user);
        }
        
        navigate('/home');
      } else {
        setError(result.message || "Credenciais inválidas. Verifique e tente novamente.");
      }
    } catch (e: any) {
      console.error('❌ Erro ao fazer login:', e);
      setError(e.message || "Erro ao conectar com servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        padding: 24,
        borderRadius: 12,
        boxShadow: "var(--box-shadow)",
        background: "var(--ocupacao-box-bg-color)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <LogIn color="var(--acao-checkin)" size={22} />
          <h1 style={{ margin: 0, fontSize: "1.25rem", lineHeight: 1 }}>Entrar</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Exemplo de acesso para testes */}
        <div style={{
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: "#374151"
        }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Exemplo de login (mock):</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <code style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px" }}>email: admin@hotel.com</code>
            <code style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px" }}>senha: admin123</code>
            <button
              type="button"
              onClick={() => { setValue("email", "admin@hotel.com"); setValue("password", "admin123"); }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-color, #D1D5DB)",
                background: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Preencher automaticamente
            </button>
          </div>
        </div>
        <label style={{ fontWeight: 600 }}>E-mail</label>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          {...register("email", {
            required: "Informe seu e-mail",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" }
          })}
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid var(--border-color, #D1D5DB)",
            outline: "none"
          }}
        />
        {errors.email && <span style={{ color: "#EF4444", fontSize: 12 }}>{errors.email.message}</span>}

        <label style={{ fontWeight: 600 }}>Senha</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            {...register("password", { required: "Informe sua senha", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
            style={{
              width: "100%",
              padding: "12px 38px 12px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-color, #D1D5DB)",
              outline: "none"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer"
            }}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <span style={{ color: "#EF4444", fontSize: 12 }}>{errors.password.message}</span>}

        {error && (
          <div style={{ color: "#EF4444", fontSize: 13 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            color: "#FFFFFF",
            background: "var(--acao-checkin)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>
          Esqueceu a senha? Contate o administrador.
        </div>
      </div>
    </div>
  );
}
