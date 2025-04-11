Lépésről-lépésre útmutató a projekt működtetéséhez
Az alábbi lépések részletesen bemutatják, hogyan kell telepíteni és elindítani a projektet. 

Kövesse az alábbi lépéseket:
1. Szükséges eszközök telepítése
•	Visual Studio 2022: Telepítse a legújabb verziót, amely támogatja az ASP.NET Core és React projekteket.
•	XAMPP Control Panel: Töltse le és telepítse az XAMPP alkalmazást, amely tartalmazza az Apache és MySQL szolgáltatásokat.
•	Microsoft Edge böngésző: Győződjön meg róla, hogy a Microsoft Edge telepítve van.

2. XAMPP konfigurálása
•	Indítsa el a XAMPP Control Panel alkalmazást.
•	Kattintson az Apache és MySQL melletti Start gombokra.
•	Nyomja meg a Config gombot a MySQL sorban, majd válassza ki a my.ini fájlt.
•	A fájlban keresse meg a max_allowed_packet beállítást, és állítsa át az értékét 64M-re.
•	Mentse el a fájlt, majd indítsa újra a MySQL szolgáltatást.

3. Adatbázis létrehozása
•	A XAMPP Control Panelben kattintson a MySQL sorban található Admin gombra, amely megnyitja a phpMyAdmin felületet.
•	A bal oldali sávban kattintson az Új gombra.
•	Az "Adatbázis neve" mezőbe írja be: synchub.
•	A mellette lévő legördülő menüből válassza ki az utf8_hungarian_ci opciót.
•	Az újonnan létrehozott synchub adatbázisra kattintva nyissa meg azt.
•	A felső menüben kattintson az Importálás gombra, majd töltse fel a mellékelt .sql adatbázis fájlt.
 

4. Projekt elindítása Visual Studio-ban
•	Nyissa meg a projekt mappáját (ossszecropp) és indítsa el az ossszecropp.sln Visual Studio Solution fájlt.
•	A Visual Studio-ban kattintson a felső menüsorban található Start gombra (vagy nyomja meg az F5 billentyűt).
•	A projekt futtatása után két böngészőlap fog megnyílni:
•	Swagger: API dokumentációs felület.
•	Synchub: Az alkalmazás webes felülete.

5. Alkalmazás használata
•	A Synchub oldalon jelentkezzen be az alábbi hitelesítő adatokkal:
•	Felhasználónév: admin@example.com
•	Jelszó: admin
•	Ezután elkezdheti az alkalmazás tesztelését vagy használatát.
