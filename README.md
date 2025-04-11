
Az alábbi részletes útmutató segít a projekt telepítésében és futtatásában, lépésről lépésre:

---

### **1. Szükséges eszközök telepítése**
- **Visual Studio 2022**:
  - Töltse le a legújabb verziót a Visual Studio hivatalos weboldaláról.
  - Telepítéskor válassza ki az *ASP.NET és webfejlesztési* munkaterhelést. Ha már telepítve van, ellenőrizze az *Eszközök > Eszközök és szolgáltatások lekérése* menüpontban, hogy ez a munkaterhelés elérhető-e[1][3].
- **XAMPP Control Panel**:
  - Töltse le és telepítse a XAMPP-ot a hivatalos weboldalról (ajánlott hely: `C:\xampp`).
  - A telepítés után indítsa el a `xampp-control.exe` fájlt, amely lehetővé teszi az Apache és MySQL szolgáltatások kezelését[4].
- **Microsoft Edge böngésző**:
  - Győződjön meg róla, hogy telepítve van a legfrissebb verzió.

---

### **2. XAMPP konfigurálása**
1. Indítsa el a XAMPP Control Panel alkalmazást.
2. Kattintson az **Apache** és **MySQL** melletti *Start* gombokra.
3. A MySQL sorban nyomja meg a *Config* gombot, majd válassza ki a `my.ini` fájlt.
4. Keresse meg a `max_allowed_packet` beállítást, és állítsa át az értékét `64M`-re.
5. Mentse el a fájlt, majd indítsa újra a MySQL szolgáltatást.

---

### **3. Adatbázis létrehozása**
1. A XAMPP Control Panelben kattintson a MySQL sorban található *Admin* gombra, amely megnyitja a phpMyAdmin felületet.
2. A bal oldali sávban kattintson az *Új* gombra.
3. Az "Adatbázis neve" mezőbe írja be: `synchub`.
4. A legördülő menüből válassza ki az `utf8_hungarian_ci` opciót.
5. Az újonnan létrehozott `synchub` adatbázisra kattintva nyissa meg azt.
6. A felső menüben kattintson az *Importálás* gombra, majd töltse fel a mellékelt `.sql` adatbázis fájlt.

---

### **4. Projekt elindítása Visual Studio-ban**
1. Nyissa meg a projekt mappáját (`ossszecropp`) és indítsa el az `ossszecropp.sln` Visual Studio Solution fájlt.
2. A Visual Studio-ban kattintson a felső menüsorban található *Start* gombra (vagy nyomja meg az F5 billentyűt).
3. A projekt futtatása után két böngészőlap fog megnyílni:
   - **Swagger**: API dokumentációs felület.
   - **Synchub**: Az alkalmazás webes felülete.

---

### **5. Alkalmazás használata**
1. Nyissa meg a Synchub oldalt.
2. Jelentkezzen be az alábbi hitelesítő adatokkal:
   - Felhasználónév: `admin@example.com`
   - Jelszó: `admin`
3. Ezután elkezdheti az alkalmazás tesztelését vagy használatát.

