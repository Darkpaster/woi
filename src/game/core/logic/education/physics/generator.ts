export interface PhysicsProblem {
    id: string;
    title: string;
    statement: string;
    difficulty: 'elementary' | 'middle-school' | 'high-school' | 'undergraduate' | 'graduate';
    topic: string;
    tikzCode: string;
    solution?: string;
}

export class PhysicsProblemsGenerator {
    private difficulties = ['elementary', 'middle-school', 'high-school', 'undergraduate', 'graduate'] as const;
    private topics = ['mechanics', 'electromagnetism', 'thermodynamics', 'optics', 'modern-physics', 'waves'] as const;

    // Хранилище задач
    private problemsDatabase: PhysicsProblem[] = [
        // Механика - начальный уровень
        {
            id: "mechanics-elementary-1",
            title: "Равномерное движение",
            statement: "Автомобиль движется с постоянной скоростью $v = 72$ км/ч. Какое расстояние он преодолеет за $t = 20$ минут?",
            difficulty: "elementary",
            topic: "mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0) -- (5,0) node[right] {$x$};
  \\draw[-stealth] (0,0) -- (0,3) node[above] {$v$};
  
  % График скорости
  \\draw[thick, blue] (0,2) -- (4,2);
  \\draw[dashed] (4,0) -- (4,2);
  
  % Точки и метки
  \\node at (-0.3,2) {$v_0$};
  \\node at (4,-0.3) {$t$};
  \\node[blue] at (2,2.3) {$v = const$};
  
  % Заштрихованная область (путь)
  \\fill[blue, opacity=0.2] (0,0) -- (0,2) -- (4,2) -- (4,0) -- cycle;
  
  % Машина
  \\node at (1,1) {\\includegraphics[width=0.8cm]{/api/placeholder/50/25}};
\\end{tikzpicture}
      `,
            solution: "Для равномерного движения: $s = v \\cdot t$. Переведем скорость в м/с: $v = 72 \\cdot \\frac{1000}{3600} = 20$ м/с. Переведем время в секунды: $t = 20 \\cdot 60 = 1200$ с. Итого: $s = 20 \\cdot 1200 = 24000$ м = $24$ км."
        },

        // Механика - средний уровень
        {
            id: "mechanics-middle-1",
            title: "Движение под действием силы тяжести",
            statement: "Мяч брошен вертикально вверх с начальной скоростью $v_0 = 15$ м/с. На какую максимальную высоту поднимется мяч? Сопротивлением воздуха пренебречь.",
            difficulty: "middle-school",
            topic: "mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Земля и система координат
  \\fill[brown!70] (-3,0) rectangle (3,-0.5);
  \\draw[-stealth] (0,0) -- (0,5) node[right] {$h$};
  \\draw[dashed] (-2,0) -- (2,0) node[right] {$h = 0$};
  
  % Траектория движения мяча
  \\draw[-stealth,thick] (0,0) -- (0,1) node[left] {$\\vec{v}_0$};
  \\draw[blue, thick, ->] (0,4.5) -- (0,3.7) node[right] {$\\vec{g}$};
  
  % Мяч в разных положениях
  \\fill[red] (0,0) circle (0.2);
  \\fill[red, opacity=0.3] (0,2) circle (0.2);
  \\fill[red, opacity=0.3] (0,4) circle (0.2);
  \\draw[dashed] (-1,4) -- (1,4) node[right] {$h_{max}$};
  
  % Указание направления движения
  \\draw[thick, -stealth, red] (0.6,0.5) -- (0.6,3);
  \\draw[thick, -stealth, red] (0.6,3.5) -- (0.6,1);
\\end{tikzpicture}
      `,
            solution: "Используем закон сохранения энергии: $E_k = E_p$, то есть $\\frac{mv_0^2}{2} = mgh_{max}$. Отсюда $h_{max} = \\frac{v_0^2}{2g} = \\frac{15^2}{2 \\cdot 9.8} = \\frac{225}{19.6} \\approx 11.5$ м."
        },

        // Механика - средняя школа
        {
            id: "mechanics-high-1",
            title: "Движение по наклонной плоскости",
            statement: "Тело массой $m = 2$ кг соскальзывает с наклонной плоскости высотой $h = 5$ м и длиной основания $l = 10$ м. Коэффициент трения $\\mu = 0.2$. Найдите скорость тела у основания плоскости, если начальная скорость равна нулю.",
            difficulty: "high-school",
            topic: "mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Наклонная плоскость
  \\draw[thick] (0,0) -- (5,0);
  \\draw[thick] (0,0) -- (0,3);
  \\draw[thick] (0,3) -- (5,0);
  
  % Размеры
  \\draw[dashed] (0,0) -- (0,-0.5);
  \\draw[dashed] (5,0) -- (5,-0.5);
  \\draw[<->] (0,-0.3) -- (5,-0.3) node[midway, below] {$l$};
  
  \\draw[dashed] (0,0) -- (-0.5,0);
  \\draw[dashed] (0,3) -- (-0.5,3);
  \\draw[<->] (-0.3,0) -- (-0.3,3) node[midway, left] {$h$};
  
  % Тело и векторы сил
  \\fill[red] (2.5,1.5) circle (0.2) node[right] {$m$};
  \\draw[-stealth, thick] (2.5,1.5) -- (2.5,0.5) node[right] {$\\vec{F_g}$};
  \\draw[-stealth, thick] (2.5,1.5) -- (3.2,2.2) node[right] {$\\vec{N}$};
  \\draw[-stealth, thick] (2.5,1.5) -- (1.8,1.8) node[left] {$\\vec{F_{fr}}$};
  
  % Угол наклона
  \\draw (0.5,0) arc (0:31:0.5) node[right] {$\\alpha$};
\\end{tikzpicture}
      `,
            solution: "Найдем угол наклона: $\\sin\\alpha = \\frac{h}{s}$, где $s = \\sqrt{h^2 + l^2} = \\sqrt{5^2 + 10^2} = \\sqrt{125} = 5\\sqrt{5}$ м. Тогда $\\sin\\alpha = \\frac{5}{5\\sqrt{5}} = \\frac{1}{\\sqrt{5}}$. По второму закону Ньютона для оси x: $ma = mg\\sin\\alpha - \\mu mg\\cos\\alpha$. Отсюда $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$. По формуле пути при равноускоренном движении: $v^2 = 2as$, то есть $v = \\sqrt{2gs(\\sin\\alpha - \\mu\\cos\\alpha)} \\approx 8.1$ м/с."
        },

        // Электромагнетизм - базовый
        {
            id: "electromagnetism-elementary-1",
            title: "Закон Ома",
            statement: "В цепи с источником ЭДС $\\mathcal{E} = 12$ В и внутренним сопротивлением $r = 1$ Ом последовательно подключен резистор с сопротивлением $R = 5$ Ом. Найдите силу тока в цепи и напряжение на резисторе.",
            difficulty: "elementary",
            topic: "electromagnetism",
            tikzCode: `
\\begin{tikzpicture}
  % Источник ЭДС
  \\draw (0,0) to[battery1=$\\mathcal{E}$] (0,2);
  \\node at (0.5,1) {$r$};
  
  % Проводники
  \\draw (0,0) -- (2,0);
  \\draw (0,2) -- (2,2);
  
  % Резистор
  \\draw (2,0) to[R=$R$] (2,2);
  
  % Направление тока
  \\draw[-stealth, red, thick] (1,2.3) -- (1.8,2.3) node[right] {$I$};
  
  % Напряжение на резисторе
  \\draw[-stealth, blue] (1.7,0.3) -- (1.7,1.7) node[right] {$U_R$};
\\end{tikzpicture}
      `,
            solution: "По закону Ома для полной цепи: $I = \\frac{\\mathcal{E}}{R + r} = \\frac{12}{5 + 1} = 2$ А. Напряжение на резисторе: $U_R = I \\cdot R = 2 \\cdot 5 = 10$ В."
        },

        // Электромагнетизм - средний
        {
            id: "electromagnetism-middle-1",
            title: "Магнитное поле проводника",
            statement: "Прямой проводник длиной $l = 20$ см с током $I = 5$ А расположен в однородном магнитном поле с индукцией $B = 0.1$ Тл под углом $\\alpha = 30^{\\circ}$ к вектору индукции. Найдите силу Ампера, действующую на проводник.",
            difficulty: "middle-school",
            topic: "electromagnetism",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0,0) -- (3,0,0) node[right] {$x$};
  \\draw[-stealth] (0,0,0) -- (0,3,0) node[above] {$y$};
  \\draw[-stealth] (0,0,0) -- (0,0,3) node[below left] {$z$};
  
  % Магнитное поле (вдоль оси z)
  \\foreach \\x in {0.5,1,...,2.5}
    \\foreach \\y in {0.5,1,...,2.5}
      \\draw[-stealth, blue] (\\x,\\y,0) -- (\\x,\\y,0.5);
  \\node[blue] at (3,2,0.5) {$\\vec{B}$};
  
  % Проводник (под углом к оси z)
  \\draw[thick, red] (1,1,0) -- (2.73,1.5,1);
  \\draw[-stealth, red, thick] (1.8,1.2,0.5) -- (2.3,1.35,0.75) node[right] {$I$};
  
  % Сила Ампера
  \\draw[-stealth, green, thick] (1.8,1.25,0.5) -- (1.8,0.5,0.5) node[below] {$\\vec{F}$};
  
  % Угол между проводником и полем
  \\draw[dashed] (1.8,1.25,0.5) -- (1.8,1.25,1.5);
  \\pic [draw, ->, "$\\alpha$", angle eccentricity=1.5] {angle = {(1.8,1.25,1.5)--(1.8,1.25,0.5)--(2.3,1.35,0.75)}};
\\end{tikzpicture}
      `,
            solution: "По закону Ампера: $F = IBl\\sin\\alpha$. Подставляем значения: $F = 5 \\cdot 0.1 \\cdot 0.2 \\cdot \\sin30^{\\circ} = 5 \\cdot 0.1 \\cdot 0.2 \\cdot 0.5 = 0.05$ Н."
        },

        // Электромагнетизм - старшая школа
        {
            id: "electromagnetism-high-1",
            title: "Электромагнитная индукция",
            statement: "Прямоугольная рамка со сторонами $a = 10$ см и $b = 15$ см содержит $N = 20$ витков провода и вращается с угловой скоростью $\\omega = 50$ рад/с в однородном магнитном поле с индукцией $B = 0.2$ Тл. Ось вращения рамки перпендикулярна линиям магнитной индукции. Найдите максимальное значение ЭДС индукции в рамке.",
            difficulty: "high-school",
            topic: "electromagnetism",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0,0) -- (4,0,0) node[right] {$x$};
  \\draw[-stealth] (0,0,0) -- (0,3,0) node[above] {$y$};
  \\draw[-stealth] (0,0,0) -- (0,0,3) node[below left] {$z$};
  
  % Магнитное поле (вдоль оси z)
  \\foreach \\x in {0.5,1,...,3.5}
    \\foreach \\y in {0.5,1,...,2.5}
      \\draw[-stealth, blue, thin] (\\x,\\y,0) -- (\\x,\\y,0.4);
  \\node[blue] at (4,2.5,0.3) {$\\vec{B}$};
  
  % Рамка (показана в положении максимального потока)
  \\draw[thick] (1.5,1) -- (3.5,1) -- (3.5,2.5) -- (1.5,2.5) -- cycle;
  
  % Размеры рамки
  \\draw[<->] (1.5,0.7) -- (3.5,0.7) node[midway, below] {$a$};
  \\draw[<->] (3.8,1) -- (3.8,2.5) node[midway, right] {$b$};
  
  % Ось вращения (вдоль оси y)
  \\draw[dashed, ->] (2.5,0) -- (2.5,3) node[above] {ось вращения};
  
  % Угловая скорость
  \\draw[red, -stealth, thick, rotate around={45:(2.5,1.75)}] (2.5,1.75) arc (0:60:0.8) node[above right] {$\\omega$};
  
  % Несколько витков рамки (схематично)
  \\draw[gray, thin] (1.6,1.1) -- (3.4,1.1) -- (3.4,2.4) -- (1.6,2.4) -- cycle;
  \\draw[gray, thin] (1.7,1.2) -- (3.3,1.2) -- (3.3,2.3) -- (1.7,2.3) -- cycle;
\\end{tikzpicture}
      `,
            solution: "Максимальная ЭДС индукции: $\\mathcal{E}_{max} = NBA\\omega$, где $A = ab$ - площадь рамки. Подставляем значения: $\\mathcal{E}_{max} = 20 \\cdot 0.2 \\cdot (0.1 \\cdot 0.15) \\cdot 50 = 20 \\cdot 0.2 \\cdot 0.015 \\cdot 50 = 3$ В."
        },

        // Термодинамика - базовый
        {
            id: "thermodynamics-elementary-1",
            title: "Изотермический процесс",
            statement: "Газ находится в цилиндре при давлении $p_1 = 200$ кПа и объеме $V_1 = 2$ л. Газ изотермически расширяется до объема $V_2 = 5$ л. Найдите конечное давление газа.",
            difficulty: "elementary",
            topic: "thermodynamics",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0) -- (6,0) node[right] {$V$, л};
  \\draw[-stealth] (0,0) -- (0,5) node[above] {$p$, кПа};
  
  % Изотерма
  \\draw[thick, blue] plot[domain=0.7:5.5, samples=100] (\\x, {4/\\x});
  \\node[blue] at (4.5,2.5) {$T = const$};
  
  % Начальное и конечное состояния
  \\fill[red] (1,4) circle (0.07) node[above right] {$(V_1,p_1)$};
  \\fill[red] (5,0.8) circle (0.07) node[above right] {$(V_2,p_2)$};
  
  % Пунктирные линии
  \\draw[dashed] (1,0) -- (1,4);
  \\draw[dashed] (0,4) -- (1,4);
  \\draw[dashed] (5,0) -- (5,0.8);
  \\draw[dashed] (0,0.8) -- (5,0.8);
  
  % Шкалы
  \\foreach \\x in {1,2,...,5}
    \\draw (\\x,0.1) -- (\\x,-0.1) node[below] {\\x};
  \\foreach \\y in {1,2,...,4}
    \\draw (0.1,\\y) -- (-0.1,\\y) node[left] {\\y00};
\\end{tikzpicture}
      `,
            solution: "При изотермическом процессе выполняется закон Бойля-Мариотта: $p_1V_1 = p_2V_2$. Отсюда $p_2 = p_1 \\cdot \\frac{V_1}{V_2} = 200 \\cdot \\frac{2}{5} = 80$ кПа."
        },

        // Термодинамика - средний
        {
            id: "thermodynamics-middle-1",
            title: "Тепловые машины",
            statement: "Тепловой двигатель получает от нагревателя количество теплоты $Q_1 = 100$ кДж и отдает холодильнику $Q_2 = 65$ кДж за цикл. Определите КПД двигателя и работу, совершаемую за один цикл.",
            difficulty: "middle-school",
            topic: "thermodynamics",
            tikzCode: `
\\begin{tikzpicture}
  % Нагреватель
  \\fill[red!30] (0,4) rectangle (5,5);
  \\node at (2.5,4.5) {Нагреватель, $T_1$};
  
  % Холодильник
  \\fill[blue!30] (0,0) rectangle (5,1);
  \\node at (2.5,0.5) {Холодильник, $T_2$};
  
  % Рабочее тело
  \\fill[gray!20] (1.5,1.5) rectangle (3.5,3.5);
  \\node at (2.5,2.5) {Рабочее тело};
  
  % Стрелки - потоки теплоты и работа
  \\draw[-stealth, thick, red] (2.5,4) -- (2.5,3.5) node[midway, right] {$Q_1$};
  \\draw[-stealth, thick, blue] (2.5,1.5) -- (2.5,1) node[midway, right] {$Q_2$};
  \\draw[-stealth, thick, green] (3.5,2.5) -- (4.5,2.5) node[midway, above] {$A$};
  
  % Формулы
  \\node at (6.5,3.5) {$\\eta = 1 - \\frac{Q_2}{Q_1}$};
  \\node at (6.5,2.5) {$A = Q_1 - Q_2$};
\\end{tikzpicture}
      `,
            solution: "КПД теплового двигателя: $\\eta = 1 - \\frac{Q_2}{Q_1} = 1 - \\frac{65}{100} = 0.35$ или $35\\%$. Работа за цикл: $A = Q_1 - Q_2 = 100 - 65 = 35$ кДж."
        },

        // Термодинамика - старшая школа
        {
            id: "thermodynamics-high-1",
            title: "Энтропия идеального газа",
            statement: "Один моль идеального газа изобарически нагревается от температуры $T_1 = 300$ К до $T_2 = 600$ К при постоянном давлении $p = 10^5$ Па. Найдите изменение энтропии газа, если его молярная теплоемкость при постоянном давлении $C_p = 29$ Дж/(моль·К).",
            difficulty: "high-school",
            topic: "thermodynamics",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0) -- (6,0) node[right] {$T$, К};
  \\draw[-stealth] (0,0) -- (0,5) node[above] {$S$, Дж/(моль·К)};
  
  % Изобара на T-S диаграмме
  \\draw[thick, blue] (1,1) -- (5,3);
  \\node[blue] at (3,3.5) {$p = const$};
  
  % Начальное и конечное состояния
  \\fill[red] (1,1) circle (0.07) node[below left] {$(T_1,S_1)$};
  \\fill[red] (5,3) circle (0.07) node[above right] {$(T_2,S_2)$};
  
  % Пунктирные линии
  \\draw[dashed] (1,0) -- (1,1);
  \\draw[dashed] (5,0) -- (5,3);
  
  % Изменение энтропии
  \\draw[<->] (0.5,1) -- (0.5,3) node[left, midway] {$\\Delta S$};
  
  % Формула
  \\node at (3,4) {$\\Delta S = C_p \\ln\\frac{T_2}{T_1}$};
  
  % Шкалы
  \\node at (1,-0.3) {300};
  \\node at (5,-0.3) {600};
\\end{tikzpicture}
      `,
            solution: "Изменение энтропии при изобарическом процессе: $\\Delta S = C_p \\ln\\frac{T_2}{T_1} = 29 \\cdot \\ln\\frac{600}{300} = 29 \\cdot \\ln2 = 29 \\cdot 0.693 = 20.1$ Дж/(моль·К)."
        },

        // Оптика - базовый
        {
            id: "optics-elementary-1",
            title: "Закон отражения",
            statement: "Луч света падает на плоское зеркало под углом $\\alpha = 30^{\\circ}$ к его поверхности. Определите угол между падающим и отраженным лучами.",
            difficulty: "elementary",
            topic: "optics",
            tikzCode: `
\\begin{tikzpicture}
  % Зеркало
  \\draw[thick] (0,0) -- (5,0);
  \\fill[gray!20] (0,-0.1) rectangle (5,-0.5);
  
  % Нормаль
  \\draw[dashed] (2.5,0) -- (2.5,3);
  
  % Падающий луч
  \\draw[-stealth, red, thick] (1,2.5) -- (2.5,0) node[midway, above left] {падающий луч};
  
  % Отраженный луч
  \\draw[-stealth, red, thick] (2.5,0) -- (4,2.5) node[midway, above right] {отраженный луч};
  
  % Углы
  \\draw (2.5,0) + (0:0.7) arc (0:60:0.7);
  \\node at (2.9,0.4) {$\\alpha$};
  
  \\draw (2.5,0) + (180:0.7) arc (180:120:0.7);
  \\node at (2.1,0.4) {$\\alpha$};
  
  % Угол между лучами
  \\draw[blue] (2.5,0) + (60:1) arc (60:120:1);
  \\node[blue] at (2.5,0.8) {$\\theta$};
\\end{tikzpicture}
      `,
            solution: "По закону отражения: угол падения равен углу отражения. Угол падения к нормали: $90^{\\circ} - \\alpha = 90^{\\circ} - 30^{\\circ} = 60^{\\circ}$. Угол между падающим и отраженным лучами: $\\theta = 2 \\cdot 60^{\\circ} = 120^{\\circ}$."
        },

        // Оптика - средний
        {
            id: "optics-middle-1",
            title: "Преломление света",
            statement: "Луч света падает из воздуха в воду под углом $\\alpha = 45^{\\circ}$ к нормали. Показатель преломления воды $n = 1.33$. Найдите угол преломления.",
            difficulty: "middle-school",
            topic: "optics",
            tikzCode: `
\\begin{tikzpicture}
  % Граница раздела сред
  \\draw[thick] (-1,0) -- (6,0);
  
  % Вода и воздух
  \\fill[blue!10] (-1,-3) rectangle (6,0);
  \\node at (5,-1.5) {вода, $n = 1.33$};
  \\node at (5,1.5) {воздух, $n = 1$};
  
  % Нормаль
  \\draw[dashed] (2.5,-3) -- (2.5,3);
  
  % Падающий луч
  \\draw[-stealth, red, thick] (0,2.5) -- (2.5,0) node[midway, above left] {падающий луч};
  
  % Преломленный луч
  \\draw[-stealth, red, thick] (2.5,0) -- (4.5,-2) node[midway, below right] {преломленный луч};
  
  % Углы
  \\draw (2.5,0) + (180:0.8) arc (180:135:0.8);
  \\node at (2,0.3) {$\\alpha$};
  
  \\draw (2.5,0) + (270:0.8) arc (270:245:0.8);
  \\node at (3,-0.5) {$\\beta$};
  
  % Формула
  \\node at (1,-2) {$n_1 \\sin\\alpha = n_2 \\sin\\beta$};
\\end{tikzpicture}
      `,
            solution: "По закону преломления света (закон Снеллиуса): $n_1 \\sin\\alpha = n_2 \\sin\\beta$. Отсюда: $\\sin\\beta = \\frac{n_1}{n_2} \\sin\\alpha = \\frac{1}{1.33} \\sin 45^{\\circ} = \\frac{1}{1.33} \\cdot \\frac{\\sqrt{2}}{2} \\approx 0.53$. Значит, $\\beta = \\arcsin(0.53) \\approx 32^{\\circ}$."
        },

        // Оптика - старшая школа
        {
            id: "optics-high-1",
            title: "Линзы",
            statement: "Тонкая собирающая линза с фокусным расстоянием $F = 15$ см создает действительное изображение предмета, расположенного перпендикулярно главной оптической оси на расстоянии $a = 25$ см от линзы. Найдите расстояние от линзы до изображения и увеличение линзы.",
            difficulty: "high-school",
            topic: "optics",
            tikzCode: `
\\begin{tikzpicture}
  % Оптическая ось
  \\draw[-stealth] (-1,0) -- (10,0) node[right] {$z$};
  
  % Линза
  \\draw[thick, blue] (3,-2) -- (3,2);
  \\draw[blue] (3,-2) .. controls (3.5,-1) and (3.5,1) .. (3,2);
  \\draw[blue] (3,-2) .. controls (2.5,-1) and (2.5,1) .. (3,2);
  \\node[blue] at (3,2.3) {линза};
  
  % Фокусы
  \\fill[red] (1.5,0) circle (0.05) node[below] {$F_1$};
  \\fill[red] (4.5,0) circle (0.05) node[below] {$F_2$};
  
  % Предмет и изображение
  \\draw[-stealth, thick] (1,0) -- (1,1.5) node[left] {предмет};
  \\draw[-stealth, thick, dashed] (7.5,0) -- (7.5,-2) node[right] {изображение};
  
  % Лучи
  \\draw[orange, thick] (1,1.5) -- (3,1.5);
  \\draw[orange, thick] (3,1.5) -- (7.5,-2);
  
  \\draw[orange, thick] (1,1.5) -- (3,0.75);
  \\draw[orange, thick] (3,0.75) -- (7.5,-2);
  
  \\draw[orange, thick] (1,1.5) -- (4.5, 0);
  \\draw[orange, thick] (4.5,0) -- (7.5,-2);
  
  % Расстояния
  \\draw[<->] (1,-2.5) -- (3,-2.5) node[midway, below] {$a$};
  \\draw[<->] (3,-2.5) -- (7.5,-2.5) node[midway, below] {$b$};
  \\draw[<->] (1.5,-3) -- (4.5,-3) node[midway, below] {$2F$};
  
  % Формула линзы
  \\node at (5,2) {$\\frac{1}{a} + \\frac{1}{b} = \\frac{1}{F}$};
  \\node at (5,1.4) {$\\Gamma = -\\frac{b}{a}$};
\\end{tikzpicture}
      `,
            solution: "Применим формулу тонкой линзы: $\\frac{1}{a} + \\frac{1}{b} = \\frac{1}{F}$. Отсюда $\\frac{1}{b} = \\frac{1}{F} - \\frac{1}{a} = \\frac{1}{15} - \\frac{1}{25} = \\frac{25-15}{15 \\cdot 25} = \\frac{10}{375} = \\frac{2}{75}$. Следовательно, $b = \\frac{75}{2} = 37.5$ см. Увеличение линзы: $\\Gamma = -\\frac{b}{a} = -\\frac{37.5}{25} = -1.5$. Знак минус означает, что изображение перевернутое."
        },

        // Волны - базовый
        {
            id: "waves-elementary-1",
            title: "Основы волновых процессов",
            statement: "Волна распространяется со скоростью $v = 340$ м/с и имеет частоту $f = 170$ Гц. Найдите длину волны и период колебаний.",
            difficulty: "elementary",
            topic: "waves",
            tikzCode: `
\\begin{tikzpicture}
  % Ось x
  \\draw[-stealth] (0,0) -- (8,0) node[right] {$x$};
  
  % Волновой профиль
  \\draw[thick, blue, smooth, samples=100, domain=0:7] plot (\\x, {sin(\\x*180)});
  
  % Длина волны
  \\draw[<->] (2,-1) -- (4,-1) node[midway, below] {$\\lambda$};
  
  % Амплитуда
  \\draw[<->] (1,0) -- (1,1) node[midway, left] {$A$};
  
  % Математическое представление
  \\node at (4,2) {$y(x,t) = A\\sin(kx - \\omega t)$};
  \\node at (4,1.4) {$\\lambda = \\frac{v}{f}$, $T = \\frac{1}{f}$};
\\end{tikzpicture}
      `,
            solution: "Длина волны определяется по формуле: $\\lambda = \\frac{v}{f} = \\frac{340}{170} = 2$ м. Период колебаний: $T = \\frac{1}{f} = \\frac{1}{170} \\approx 0.0059$ с = $5.9$ мс."
        },

        // Волны - средний
        {
            id: "waves-middle-1",
            title: "Интерференция волн",
            statement: "Два когерентных источника колебаний с длиной волны $\\lambda = 0.5$ м расположены на расстоянии $d = 1.5$ м друг от друга. На каком расстоянии от прямой, соединяющей источники, будет наблюдаться второй интерференционный максимум для точки, равноудаленной от обоих источников?",
            difficulty: "middle-school",
            topic: "waves",
            tikzCode: `
\\begin{tikzpicture}
  % Источники
  \\fill[red] (0,0) circle (0.1) node[below] {$S_1$};
  \\fill[red] (3,0) circle (0.1) node[below] {$S_2$};
  
  % Линия, соединяющая источники
  \\draw[dashed] (-1,0) -- (4,0);
  
  % Фронты волн (концентрические окружности)
  \\foreach \\i in {0.5,1,...,3}
    \\draw[blue, thin] (0,0) circle (\\i);
  \\foreach \\i in {0.5,1,...,3}
    \\draw[blue, thin] (3,0) circle (\\i);
  
  % Максимумы интерференции
  \\draw[thick, green] plot[domain=-1:4, samples=100] (\\x, {1.5*sqrt(abs(1-pow((\\x-1.5)/1.5,2)))});
  \\draw[thick, green] plot[domain=-1:4, samples=100] (\\x, {-1.5*sqrt(abs(1-pow((\\x-1.5)/1.5,2)))});
  
  % Точка наблюдения второго максимума
  \\fill[purple] (1.5,2.5) circle (0.1) node[above right] {$P$};
  \\draw[purple] (1.5,0) -- (1.5,2.5);
  
  % Соответствующие расстояния
  \\draw[red, dashed] (0,0) -- (1.5,2.5);
  \\draw[red, dashed] (3,0) -- (1.5,2.5);
  
  % Формула условия максимумов
  \\node at (5,2) {$\\Delta r = m\\lambda, m = 0, 1, 2, ...$};
\\end{tikzpicture}
      `,
            solution: "Для интерференционного максимума должно выполняться условие: $\\Delta r = m\\lambda$, где $\\Delta r$ - разность хода волн от двух источников, $m$ - порядок максимума. Для точки, равноудаленной от обоих источников на прямой, перпендикулярной к линии, соединяющей источники, получаем $\\Delta r = 0$, что соответствует $m = 0$ (центральный максимум). Для второго максимума ($m = 2$) должно выполняться: $\\Delta r = 2\\lambda = 2 \\cdot 0.5 = 1$ м. Используя теорему Пифагора и симметрию задачи, получаем, что расстояние $h$ от линии источников до точки наблюдения связано с разностью хода так: $\\Delta r = \\sqrt{h^2 + (\\frac{d}{2})^2} - \\sqrt{h^2 + (\\frac{d}{2})^2} = 2\\sqrt{h^2 + (\\frac{d}{2})^2} - d = 1$ м. Отсюда $\\sqrt{h^2 + (\\frac{1.5}{2})^2} = \\frac{1 + 1.5}{2} = 1.25$ м, и $h = \\sqrt{1.25^2 - 0.75^2} \\approx 1$ м."
        },

        // Волны - старшая школа
        {
            id: "waves-high-1",
            title: "Дифракция света",
            statement: "На дифракционную решетку с периодом $d = 2$ мкм нормально падает монохроматический свет с длиной волны $\\lambda = 500$ нм. Определите угол, под которым наблюдается дифракционный максимум второго порядка.",
            difficulty: "high-school",
            topic: "waves",
            tikzCode: `
\\begin{tikzpicture}
  % Дифракционная решетка
  \\fill[gray!30] (0,-2) rectangle (5,-1.8);
  \\foreach \\i in {0,0.5,...,5}
    \\fill[black] (\\i,-2) rectangle (\\i+0.25,-1.8);
  \\node at (2.5,-1.5) {дифракционная решетка};
  
  % Падающий свет
  \\foreach \\i in {-1.5,-1,...,-0.5}
    \\draw[-stealth, thin, orange] (2.5,\\i) -- (2.5,-1.8);
  \\node at (1.8,-1) {падающий свет, $\\lambda$};
  
  % Дифракционная картина
  \\draw[-stealth, thick] (2.5,-2) -- (2.5,0) node[above] {$m = 0$};
  \\draw[-stealth, thick] (2.5,-2) -- (3.5,0) node[above] {$m = 1$};
  \\draw[-stealth, thick] (2.5,-2) -- (1.5,0) node[above] {$m = -1$};
  \\draw[-stealth, thick] (2.5,-2) -- (4.7,0) node[above] {$m = 2$};
  \\draw[-stealth, thick] (2.5,-2) -- (0.3,0) node[above] {$m = -2$};
  
  % Угол дифракции
  \\draw (2.5,-2) + (0:1) arc (0:30:1);
  \\node at (3.1,-1.6) {$\\theta$};
  
  % Формула дифракционной решетки
  \\node at (7,-1) {$d\\sin\\theta = m\\lambda$};
\\end{tikzpicture}
      `,
            solution: "По формуле дифракционной решетки: $d\\sin\\theta = m\\lambda$, где $m$ - порядок дифракционного максимума. Для $m = 2$: $\\sin\\theta = \\frac{m\\lambda}{d} = \\frac{2 \\cdot 500 \\cdot 10^{-9}}{2 \\cdot 10^{-6}} = \\frac{10^{-6}}{2 \\cdot 10^{-6}} = 0.5$. Отсюда $\\theta = \\arcsin(0.5) = 30^{\\circ}$."
        },

        // Современная физика - базовый
        {
            id: "modern-physics-elementary-1",
            title: "Фотоэффект",
            statement: "При облучении металла светом с длиной волны $\\lambda = 300$ нм наблюдается фотоэффект. Работа выхода электрона из этого металла $A = 3.5$ эВ. Найдите максимальную кинетическую энергию вылетающих фотоэлектронов.",
            difficulty: "elementary",
            topic: "modern-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Металлическая пластина
  \\fill[gray!50] (0,-1) rectangle (5,0);
  
  % Падающий свет
  \\foreach \\i in {0.5,1.5,...,4.5}
    \\draw[-stealth, orange, thick] (\\i,2) -- (\\i,0);
  \\node at (2.5,1.5) {$h\\nu$};
  
  % Вылетающие электроны
  \\foreach \\i in {0.7,1.7,...,4.7}
    \\draw[-stealth, blue, thick] (\\i-0.2,-0.5) -- (\\i+0.5,-1.5);
  \\node at (3.5,-1) {$e^-$};
  
  % Энергетическая диаграмма
  \\draw[->] (6,0) -- (9,0) node[right] {$E$};
  \\draw[thick] (6,-2) -- (8,-2);
  \\fill[gray!20] (6,-3) rectangle (8,-2);
  \\draw[<->] (8.5,-2) -- (8.5,0) node[midway, right] {$A$};
  \\draw[<->] (8.5,-3) -- (8.5,-2) node[midway, right] {$E_k$};
  \\draw[-stealth, orange] (7,1) -- (7,-1);
  \\node at (7.5,0.5) {$h\\nu$};
  
  % Уравнение Эйнштейна
  \\node at (7,-3.5) {$h\\nu = A + E_k$};
\\end{tikzpicture}
      `,
            solution: "По уравнению Эйнштейна для фотоэффекта: $h\\nu = A + E_k$. Энергия фотона: $h\\nu = \\frac{hc}{\\lambda} = \\frac{6.63 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8}{300 \\cdot 10^{-9}} \\approx 6.63 \\cdot 10^{-19}$ Дж $\\approx 4.14$ эВ. Тогда максимальная кинетическая энергия электронов: $E_k = h\\nu - A = 4.14 - 3.5 = 0.64$ эВ."
        },

        // Современная физика - средний
        {
            id: "modern-physics-middle-1",
            title: "Модель атома Бора",
            statement: "Вычислите энергию фотона, излучаемого при переходе электрона в атоме водорода с третьего энергетического уровня на второй. Постоянная Ридберга $R = 1.097 \\cdot 10^7$ м$^{-1}$.",
            difficulty: "middle-school",
            topic: "modern-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Ядро
  \\fill[red] (0,0) circle (0.2) node[above right] {$p^+$};
  
  % Орбитали
  \\draw[thick] (0,0) circle (1);
  \\draw[thick] (0,0) circle (2);
  \\draw[thick] (0,0) circle (3);
  \\node at (1,0.3) {$n=1$};
  \\node at (2,0.3) {$n=2$};
  \\node at (3,0.3) {$n=3$};
  
  % Электрон и переход
  \\fill[blue] (3,0) circle (0.1) node[above right] {$e^-$};
  \\draw[-stealth, green, thick] (3,0) arc (0:-110:3) -- (1.3,-1.53);
  \\fill[blue] (1.3,-1.53) circle (0.1);
  
  % Излучаемый фотон
  \\draw[-stealth, orange, snake it] (2,-0.5) -- (4,-2) node[right] {$h\\nu$};
  
  % Энергетическая диаграмма
  \\draw[->] (5,-3) -- (5,1) node[above] {$E$};
  \\draw[thick] (4.5,-2.8) -- (5.5,-2.8) node[right] {$n=1$};
  \\draw[thick] (4.5,-1.8) -- (5.5,-1.8) node[right] {$n=2$};
  \\draw[thick] (4.5,-0.8) -- (5.5,-0.8) node[right] {$n=3$};
  \\draw[-stealth, orange, snake it] (5,-0.8) -- (5,-1.8);
  \\node[orange] at (5.5,-1.3) {$h\\nu$};
  
  % Формула Бальмера
  \\node at (3,-3) {$\\frac{1}{\\lambda} = R(\\frac{1}{n_f^2} - \\frac{1}{n_i^2})$};
\\end{tikzpicture}
      `,
            solution: "По формуле Бальмера для спектра атома водорода: $\\frac{1}{\\lambda} = R(\\frac{1}{n_f^2} - \\frac{1}{n_i^2})$, где $n_i$ - начальный уровень, $n_f$ - конечный уровень. Для перехода с $n_i = 3$ на $n_f = 2$: $\\frac{1}{\\lambda} = 1.097 \\cdot 10^7 \\cdot (\\frac{1}{2^2} - \\frac{1}{3^2}) = 1.097 \\cdot 10^7 \\cdot (\\frac{1}{4} - \\frac{1}{9}) = 1.097 \\cdot 10^7 \\cdot \\frac{5}{36} \\approx 1.524 \\cdot 10^6$ м$^{-1}$. Отсюда $\\lambda \\approx 6.56 \\cdot 10^{-7}$ м = $656$ нм. Энергия фотона: $E = h\\nu = \\frac{hc}{\\lambda} = \\frac{6.63 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8}{6.56 \\cdot 10^{-7}} \\approx 3.03 \\cdot 10^{-19}$ Дж $\\approx 1.89$ эВ."
        },

        // Современная физика - старшая школа
        {
            id: "modern-physics-high-1",
            title: "Квантовая механика",
            statement: "Электрон находится в одномерной потенциальной яме шириной $L = 1$ нм. Найдите энергию электрона в основном состоянии и на первом возбужденном уровне. Масса электрона $m_e = 9.1 \\cdot 10^{-31}$ кг, постоянная Планка $h = 6.63 \\cdot 10^{-34}$ Дж·с.",
            difficulty: "high-school",
            topic: "modern-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Потенциальная яма
  \\draw[thick] (-0.5,0) -- (0,0) -- (0,3) -- (4,3) -- (4,0) -- (4.5,0);
  \\fill[blue!10] (0,0) rectangle (4,3);
  
  % Энергетические уровни
  \\draw[red, thick] (0,0.5) -- (4,0.5) node[right] {$E_1$};
  \\draw[red, thick] (0,2) -- (4,2) node[right] {$E_2$};
  
  % Волновые функции
  \\draw[blue, smooth, samples=100, domain=0:4] plot (\\x, {0.5 + 0.4*sin(\\x*180/4)});
  \\draw[blue, smooth, samples=100, domain=0:4] plot (\\x, {2 + 0.7*sin(2*\\x*180/4)});
  
  % Обозначения
  \\draw[<->] (0,-0.3) -- (4,-0.3) node[midway, below] {$L$};
  \\node at (2,3.5) {$U = \\infty$};
  \\node at (2,-1) {$U = 0$};
  
  % Формулы для энергии
  \\node at (6,1.5) {$E_n = \\frac{n^2\\pi^2\\hbar^2}{2m_eL^2}$};
  \\node at (6,0.5) {$n = 1, 2, 3, ...$};
\\end{tikzpicture}
      `,
            solution: "Для частицы в одномерной потенциальной яме энергетические уровни определяются формулой: $E_n = \\frac{n^2\\pi^2\\hbar^2}{2m_eL^2}$, где $n$ - квантовое число, $\\hbar = \\frac{h}{2\\pi}$. Для основного состояния ($n = 1$): $E_1 = \\frac{\\pi^2\\hbar^2}{2m_eL^2} = \\frac{\\pi^2 \\cdot (6.63 \\cdot 10^{-34})^2}{8\\pi^2 \\cdot 9.1 \\cdot 10^{-31} \\cdot (10^{-9})^2} = \\frac{(6.63 \\cdot 10^{-34})^2}{8 \\cdot 9.1 \\cdot 10^{-31} \\cdot 10^{-18}} \\approx 6.03 \\cdot 10^{-20}$ Дж $\\approx 0.38$ эВ. Для первого возбужденного уровня ($n = 2$): $E_2 = 4E_1 = 4 \\cdot 6.03 \\cdot 10^{-20} = 2.41 \\cdot 10^{-19}$ Дж $\\approx 1.51$ эВ."
        },

        // Механика - уровень университета
        {
            id: "mechanics-undergraduate-1",
            title: "Вращательное движение твердого тела",
            statement: "Однородный диск массой $m = 2$ кг и радиусом $R = 20$ см вращается вокруг неподвижной оси, проходящей через его центр, с угловой скоростью $\\omega = 10$ рад/с. К краю диска прикладывают тангенциальную силу торможения $F = 4$ Н. Сколько времени потребуется, чтобы диск остановился?",
            difficulty: "undergraduate",
            topic: "mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Система координат
  \\draw[-stealth] (-3,0) -- (3,0) node[right] {$x$};
  \\draw[-stealth] (0,-3) -- (0,3) node[above] {$y$};
  
  % Диск
  \\draw[thick] (0,0) circle (2);
  \\fill[gray!20] (0,0) circle (2);
  \\fill[white] (0,0) circle (0.2);
  \\draw (0,0) circle (0.2);
  
  % Указание вращения
  \\draw[-stealth, thick, red, rotate=30] (0,0) arc (0:60:2);
  \\node[red] at (1,1.5) {$\\omega$};
  
  % Сила торможения
  \\draw[-stealth, thick, blue] (2,0) -- (2,-1) node[right] {$\\vec{F}$};
  
  % Радиус
  \\draw[dashed] (0,0) -- (2,0) node[midway, above] {$R$};
  
  % Момент инерции и момент силы
  \\node at (0,-2.5) {$I = \\frac{1}{2}mR^2$};
  \\node at (3.5,-1) {$M = -FR$};
  \\node at (3.5,-1.7) {$M = I\\alpha$};
\\end{tikzpicture}
      `,
            solution: "Момент инерции диска: $I = \\frac{1}{2}mR^2 = \\frac{1}{2} \\cdot 2 \\cdot 0.2^2 = 0.04$ кг·м$^2$. Момент силы торможения: $M = -FR = -4 \\cdot 0.2 = -0.8$ Н·м. По второму закону Ньютона для вращательного движения: $M = I\\alpha$, где $\\alpha$ - угловое ускорение. Отсюда $\\alpha = \\frac{M}{I} = \\frac{-0.8}{0.04} = -20$ рад/с$^2$. Время до остановки при равнозамедленном вращении: $t = \\frac{\\omega}{|\\alpha|} = \\frac{10}{20} = 0.5$ с."
        },

        // Электромагнетизм - уровень университета
        {
            id: "electromagnetism-undergraduate-1",
            title: "Электромагнитные колебания",
            statement: "В колебательном контуре, состоящем из конденсатора емкостью $C = 2$ мкФ и катушки индуктивностью $L = 0.5$ Гн, происходят свободные электромагнитные колебания. Максимальное напряжение на конденсаторе $U_{max} = 10$ В. Найдите максимальный ток в контуре и полную энергию колебаний.",
            difficulty: "undergraduate",
            topic: "electromagnetism",
            tikzCode: `
\\begin{tikzpicture}
  % Контур
  \\draw (0,0) to[C=$C$] (0,2);
  \\draw (0,2) -- (2,2);
  \\draw (2,0) -- (2,2);
  \\draw (0,0) to[L=$L$] (2,0);
  
  % Графики колебаний
  \\draw[-stealth] (3,0) -- (7,0) node[right] {$t$};
  \\draw[-stealth] (3,0) -- (3,3) node[above] {$U,I$};
  
  % Напряжение и ток в функции времени
  \\draw[thick, blue, smooth, samples=100, domain=3:7] plot (\\x, {2*sin((\\x-3)*180)});
    \\draw[thick, red, smooth, samples=100, domain=3:7] plot (\\x, {2*sin((\\x-3)*180 + 90)});
    \\node[blue] at (7,2) {$U(t)$};
    \\node[red] at (7,1) {$I(t)$};
    
    % Формулы
    \\node at (5,3.5) {$\\omega = \\frac{1}{\\sqrt{LC}}$};
    \\node at (5,4.1) {$I_{max} = U_{max}\\sqrt{\\frac{C}{L}}$};
    \\node at (5,4.7) {$W = \\frac{CU_{max}^2}{2}$};
\\end{tikzpicture}
      `,
            solution: "Собственная частота колебаний контура: $\\omega = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{0.5 \\cdot 2 \\cdot 10^{-6}}} = \\frac{1}{10^{-3}} = 1000$ рад/с. Максимальный ток в контуре: $I_{max} = U_{max}\\sqrt{\\frac{C}{L}} = 10 \\cdot \\sqrt{\\frac{2 \\cdot 10^{-6}}{0.5}} = 10 \\cdot \\sqrt{4 \\cdot 10^{-6}} = 10 \\cdot 2 \\cdot 10^{-3} = 0.02$ А = $20$ мА. Полная энергия колебаний: $W = \\frac{CU_{max}^2}{2} = \\frac{2 \\cdot 10^{-6} \\cdot 10^2}{2} = 10^{-4}$ Дж = $0.1$ мДж."
        },

        // Термодинамика - уровень университета
        {
            id: "thermodynamics-undergraduate-1",
            title: "Термодинамический цикл",
            statement: "Идеальный одноатомный газ совершает цикл, состоящий из двух изохор и двух изобар. Наименьший объем газа $V_1 = 2$ л, наибольший объем $V_2 = 6$ л, наименьшее давление $p_1 = 100$ кПа, наибольшее давление $p_2 = 300$ кПа. Найдите работу газа за цикл и КПД цикла.",
            difficulty: "undergraduate",
            topic: "thermodynamics",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (0,0) -- (7,0) node[right] {$V$, л};
  \\draw[-stealth] (0,0) -- (0,6) node[above] {$p$, кПа};
  
  % Цикл
  \\draw[thick, ->] (2,1) -- (2,3) -- (6,3) -- (6,1) -- cycle;
  
  % Точки цикла
  \\fill[red] (2,1) circle (0.1) node[below left] {$1$};
  \\fill[red] (2,3) circle (0.1) node[above left] {$2$};
  \\fill[red] (6,3) circle (0.1) node[above right] {$3$};
  \\fill[red] (6,1) circle (0.1) node[below right] {$4$};
  
  % Процессы
  \\node[blue] at (1.5,2) {изохора};
  \\node[blue] at (4,3.5) {изобара};
  \\node[blue] at (6.5,2) {изохора};
  \\node[blue] at (4,0.5) {изобара};
  
  % Сетка и шкалы
  \\foreach \\x in {2,4,6}
    \\draw (\\x,0.1) -- (\\x,-0.1) node[below] {\\x};
  \\foreach \\y in {1,2,3}
    \\draw (0.1,\\y) -- (-0.1,\\y) node[left] {\\y00};
  
  % Работа (площадь цикла)
  \\pattern[pattern=north east lines, pattern color=gray] (2,1) -- (2,3) -- (6,3) -- (6,1) -- cycle;
\\end{tikzpicture}
      `,
            solution: "Работа газа за цикл равна площади цикла на $pV$-диаграмме: $A = (p_2 - p_1)(V_2 - V_1) = (300 - 100)(6 - 2) \\cdot 10^{-3} = 200 \\cdot 4 \\cdot 10^{-3} = 0.8$ кДж. Чтобы найти КПД, нужно вычислить подведенное тепло. Оно состоит из тепла на изохорическом нагревании $1 \\to 2$ и тепла на изобарическом расширении $2 \\to 3$. Для одноатомного газа $c_V = \\frac{3}{2}R$, $c_p = \\frac{5}{2}R$. $Q_{12} = c_V \\nu (T_2 - T_1) = \\frac{3}{2}R\\nu\\frac{p_2 - p_1}{p_1}T_1 = \\frac{3}{2}R\\nu\\frac{200}{100}T_1 = 3R\\nu T_1$. $Q_{23} = c_p \\nu (T_3 - T_2) = \\frac{5}{2}R\\nu\\frac{V_2 - V_1}{V_1}T_2 = \\frac{5}{2}R\\nu\\frac{4}{2}T_2 = 5R\\nu T_2 = 5R\\nu \\cdot 3T_1 = 15R\\nu T_1$. Итого $Q_{+} = 3R\\nu T_1 + 15R\\nu T_1 = 18R\\nu T_1$. КПД: $\\eta = \\frac{A}{Q_{+}} = \\frac{0.8}{18R\\nu T_1} = \\frac{(p_2 - p_1)(V_2 - V_1)}{18R\\nu T_1} = \\frac{200 \\cdot 4 \\cdot 10^{-3}}{18 \\cdot 8.31 \\cdot \\frac{p_1V_1}{RT_1} \\cdot T_1} = \\frac{0.8}{18 \\cdot 8.31 \\cdot 0.1 \\cdot 0.002} \\approx 0.267$ или $26.7\\%$."
        },

        // Оптика - уровень университета
        {
            id: "optics-undergraduate-1",
            title: "Интерференция в тонких пленках",
            statement: "На тонкую мыльную пленку толщиной $d = 400$ нм падает белый свет под углом $\\alpha = 30^{\\circ}$. Показатель преломления пленки $n = 1.33$. Какие длины волн видимого света (в диапазоне от 400 до 700 нм) будут максимально усилены при отражении от пленки?",
            difficulty: "undergraduate",
            topic: "optics",
            tikzCode: `
\\begin{tikzpicture}
  % Пленка
  \\fill[blue!10] (0,0) rectangle (5,0.5);
  \\node at (5.5,0.25) {$n = 1.33$};
  
  % Падающий, отраженный и преломленный лучи
  \\draw[-stealth, thick, orange] (-1,2) -- (1,0.5) node[midway, above] {падающий};
  \\draw[-stealth, thick, orange] (1,0.5) -- (3,2) node[midway, above] {отраженный};
  \\draw[-stealth, thick, orange, dashed] (1,0.5) -- (2,0) node[midway, right] {преломленный};
  \\draw[-stealth, thick, orange, dashed] (2,0) -- (3,0.5);
  \\draw[-stealth, thick, orange] (3,0.5) -- (5,2) node[midway, above] {интерференция};
  
  % Углы
  \\draw (1,0.5) + (180:0.5) arc (180:150:0.5);
  \\node at (0.7,0.7) {$\\alpha$};
  \\draw (1,0.5) + (270:0.5) arc (270:240:0.5);
  \\node at (1.3,0.2) {$\\beta$};
  
  % Толщина пленки
  \\draw[<->] (-0.5,0) -- (-0.5,0.5) node[left, midway] {$d$};
  
  % Оптическая разность хода
  \\node at (2.5,-1) {$\\Delta = 2dn\\cos\\beta + \\frac{\\lambda}{2}$};
  \\node at (2.5,-1.7) {Условие максимумов: $\\Delta = m\\lambda$};
\\end{tikzpicture}
      `,
            solution: "При отражении от оптически более плотной среды происходит потеря полуволны, поэтому оптическая разность хода: $\\Delta = 2dn\\cos\\beta + \\frac{\\lambda}{2}$. Условие максимумов: $2dn\\cos\\beta + \\frac{\\lambda}{2} = m\\lambda$, или $2dn\\cos\\beta = (m - \\frac{1}{2})\\lambda$. По закону Снеллиуса: $\\sin\\alpha = n\\sin\\beta$, откуда $\\sin\\beta = \\frac{\\sin\\alpha}{n} = \\frac{\\sin 30^{\\circ}}{1.33} = \\frac{0.5}{1.33} \\approx 0.376$ и $\\beta \\approx 22.1^{\\circ}$. Тогда $\\cos\\beta \\approx 0.927$. Подставляем в условие максимумов: $\\lambda = \\frac{2dn\\cos\\beta}{m - \\frac{1}{2}} = \\frac{2 \\cdot 400 \\cdot 10^{-9} \\cdot 1.33 \\cdot 0.927}{m - \\frac{1}{2}} = \\frac{986 \\cdot 10^{-9}}{m - \\frac{1}{2}}$. Для $m = 3$: $\\lambda_3 = \\frac{986 \\cdot 10^{-9}}{2.5} \\approx 394$ нм (вне видимого диапазона). Для $m = 2$: $\\lambda_2 = \\frac{986 \\cdot 10^{-9}}{1.5} \\approx 657$ нм (красный). Для $m = 1$: $\\lambda_1 = \\frac{986 \\cdot 10^{-9}}{0.5} \\approx 1972$ нм (инфракрасный, вне видимого диапазона). Таким образом, в видимом диапазоне будет усилена длина волны около 657 нм (красный свет)."
        },

        // Современная физика - уровень университета
        {
            id: "modern-physics-undergraduate-1",
            title: "Эффект Комптона",
            statement: "Фотон с энергией $E = 0.51$ МэВ рассеивается на свободном электроне. Найдите энергию фотона после рассеяния на угол $\\theta = 90^{\\circ}$. Масса покоя электрона $m_e = 9.1 \\cdot 10^{-31}$ кг, скорость света $c = 3 \\cdot 10^8$ м/с, постоянная Планка $h = 6.63 \\cdot 10^{-34}$ Дж·с.",
            difficulty: "undergraduate",
            topic: "modern-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Начальная траектория фотона
  \\draw[-stealth, thick, orange] (0,0) -- (3,0) node[midway, above] {$E$};
  
  % Электрон
  \\fill[blue] (3,0) circle (0.1) node[below] {$e^-$};
  
  % Рассеянный фотон
  \\draw[-stealth, thick, orange] (3,0) -- (3,3) node[midway, right] {$E'$};
  
  % Отдача электрона
  \\draw[-stealth, thick, blue] (3,0) -- (4.5,-1.5) node[right] {$e^-$};
  
  % Угол рассеяния
  \\draw (3,0) + (0:0.5) arc (0:90:0.5);
  \\node at (3.3,0.3) {$\\theta$};
  
  % Формула Комптона
  \\node at (1.5,-1.5) {$\\lambda' - \\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)$};
  \\node at (1.5,-2.1) {$\\frac{1}{E'} - \\frac{1}{E} = \\frac{1}{m_e c^2}(1 - \\cos\\theta)$};
\\end{tikzpicture}
      `,
            solution: "Формула Комптона для энергии: $\\frac{1}{E'} - \\frac{1}{E} = \\frac{1}{m_e c^2}(1 - \\cos\\theta)$. Энергия покоя электрона: $m_e c^2 = 9.1 \\cdot 10^{-31} \\cdot (3 \\cdot 10^8)^2 = 8.19 \\cdot 10^{-14}$ Дж $\\approx 0.51$ МэВ. Для $\\theta = 90^{\\circ}$, $\\cos\\theta = 0$. Подставляя значения: $\\frac{1}{E'} - \\frac{1}{0.51} = \\frac{1}{0.51}(1 - 0) = \\frac{1}{0.51}$, откуда $\\frac{1}{E'} = \\frac{2}{0.51}$ и $E' = \\frac{0.51}{2} = 0.255$ МэВ."
        },

        // Механика - graduate
        {
            id: "mechanics-graduate-1",
            title: "Задача о движении гироскопа",
            statement: "Симметричный гироскоп с моментами инерции $I_1 = I_2 = 0.2$ кг·м$^2$ и $I_3 = 0.1$ кг·м$^2$ вращается вокруг оси симметрии с угловой скоростью $\\omega_3 = 50$ рад/с. Ось гироскопа составляет угол $\\theta = 30^{\\circ}$ с вертикалью, а центр масс находится на оси симметрии на расстоянии $l = 0.1$ м от точки опоры. Масса гироскопа $m = 2$ кг. Найдите угловую скорость прецессии гироскопа.",
            difficulty: "graduate",
            topic: "mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Система координат
  \\draw[-stealth] (0,0,0) -- (4,0,0) node[right] {$x$};
  \\draw[-stealth] (0,0,0) -- (0,4,0) node[right] {$y$};
  \\draw[-stealth] (0,0,0) -- (0,0,4) node[left] {$z$};
  
  % Вертикаль
  \\draw[dashed] (0,0,0) -- (0,0,3.5);
  
  % Ось гироскопа
  \\draw[thick, blue] (0,0,0) -- (1.5,0,3);
  \\fill[red] (1,0,2) circle (0.1) node[above right] {$C$};
  
  % Гироскоп (схематично)
  \\draw[fill=gray!20] (1.5,0,3) ellipse (0.3 and 0.3);
  \\draw[fill=gray!20] (0,0,0) circle (0.2);
  
  % Угол с вертикалью
  \\pic [draw, ->, "$\\theta$", angle eccentricity=1.5] {angle = {(0,0,3.5)--(0,0,0)--(1.5,0,3)}};
  
  % Вектор угловой скорости вращения
  \\draw[-stealth, red, thick] (1.5,0,3) -- (2.5,0,3.5) node[right] {$\\vec{\\omega}_3$};
  
  % Вектор углового момента
  \\draw[-stealth, green, thick] (0,0,0) -- (2,0,4) node[above] {$\\vec{L}$};
  
  % Вектор силы тяжести
  \\draw[-stealth, black, thick] (1,0,2) -- (1,0,1.2) node[right] {$\\vec{mg}$};
  
  % Вектор скорости прецессии
  \\draw[-stealth, purple, thick, rotate around={-30:(0,0,0)}] (0.5,0,1) arc (0:40:0.5);
  \\node[purple] at (0.5,0.5,1) {$\\vec{\\Omega}$};
  
  % Формула прецессии
  \\node at (5,2) {$\\Omega = \\frac{mgl\\sin\\theta}{L} = \\frac{mgl\\sin\\theta}{I_3\\omega_3}$};
\\end{tikzpicture}
      `,
            solution: "Угловая скорость прецессии гироскопа определяется формулой: $\\Omega = \\frac{mgl\\sin\\theta}{L}$, где $L = I_3\\omega_3$ - модуль момента импульса. Подставляем значения: $\\Omega = \\frac{2 \\cdot 9.8 \\cdot 0.1 \\cdot \\sin 30^{\\circ}}{0.1 \\cdot 50} = \\frac{2 \\cdot 9.8 \\cdot 0.1 \\cdot 0.5}{5} = \\frac{0.98}{5} = 0.196$ рад/с."
        },

        // Электромагнетизм - graduate
        {
            id: "electromagnetism-graduate-1",
            title: "Уравнения Максвелла в волноводе",
            statement: "Прямоугольный волновод с размерами $a = 2$ см и $b = 1$ см заполнен диэлектриком с проницаемостью $\\varepsilon = 2.25$. Найдите частоту отсечки для волны типа $TE_{11}$ и фазовую скорость этой волны при частоте $f = 12$ ГГц.",
            difficulty: "graduate",
            topic: "electromagnetism",
            tikzCode: `
\\begin{tikzpicture}
  % Волновод (проекция)
  \\draw[thick] (0,0) rectangle (4,2);
  
  % Размеры
  \\draw[<->] (0,-0.5) -- (4,-0.5) node[midway, below] {$a$};
  \\draw[<->] (4.5,0) -- (4.5,2) node[midway, right] {$b$};
  
  % Распространение волны
  \\draw[-stealth, thick, blue] (0,1) -- (4,1) node[right] {$\\vec{k}$};
  
  % Электрическое поле (для TE11)
  \\foreach \\x in {0.5,1.5,2.5,3.5} {
    \\foreach \\y in {0.5,1.5} {
      \\draw[-stealth, red] (\\x,\\y) -- (\\x,\\y+0.3);
    }
  }
  \\node[red] at (2,2.5) {$\\vec{E}$};
  
  % Магнитное поле (для TE11)
  \\foreach \\x in {1,2,3} {
    \\foreach \\y in {1} {
      \\draw[-stealth, green] (\\x,\\y) circle (0.1);
      \\fill[green] (\\x-0.05,\\y) circle (0.02);
    }
  }
  \\node[green] at (3.5,0.5) {$\\vec{H}$};
  
  % 3D проекция волновода
  \\begin{scope}[xshift=6cm]
    \\draw[thick] (0,0,0) -- (3,0,0) -- (3,2,0) -- (0,2,0) -- cycle;
    \\draw[thick] (0,0,0) -- (0,0,1) -- (3,0,1) -- (3,0,0);
    \\draw[thick] (0,2,0) -- (0,2,1) -- (3,2,1) -- (3,2,0);
    \\draw[thick] (0,0,1) -- (0,2,1);
    \\draw[thick] (3,0,1) -- (3,2,1);
    
    % Волновые числа
    \\node at (1.5,-0.5,0) {$k_x = \\frac{\\pi}{a}$};
    \\node at (3.5,1,0) {$k_y = \\frac{\\pi}{b}$};
    \\node at (1.5,1,1.3) {$k_z = \\sqrt{k^2 - k_c^2}$};
  \\end{scope}
  
  % Формулы
  \\node at (3,-1.5) {$k_c = \\sqrt{\\left(\\frac{m\\pi}{a}\\right)^2 + \\left(\\frac{n\\pi}{b}\\right)^2}$};
  \\node at (3,-2.1) {$f_c = \\frac{c}{2\\pi\\sqrt{\\varepsilon}}k_c$};
  \\node at (3,-2.7) {$v_{ph} = \\frac{c}{\\sqrt{\\varepsilon}}\\sqrt{1-\\left(\\frac{f_c}{f}\\right)^2}$};
\\end{tikzpicture}
      `,
            solution: "Для волны типа $TE_{mn}$ частота отсечки определяется формулой: $f_c = \\frac{c}{2\\sqrt{\\varepsilon}}\\sqrt{\\left(\\frac{m}{a}\\right)^2 + \\left(\\frac{n}{b}\\right)^2}$. Для $TE_{11}$: $f_c = \\frac{3 \\cdot 10^8}{2\\sqrt{2.25}}\\sqrt{\\left(\\frac{1}{0.02}\\right)^2 + \\left(\\frac{1}{0.01}\\right)^2} = \\frac{3 \\cdot 10^8}{3}\\sqrt{2500 + 10000} = 10^8\\sqrt{12500} \\approx 10^8 \\cdot 111.8 = 11.18$ ГГц. Фазовая скорость: $v_{ph} = \\frac{c}{\\sqrt{\\varepsilon}}\\sqrt{1-\\left(\\frac{f_c}{f}\\right)^2} = \\frac{3 \\cdot 10^8}{1.5}\\sqrt{1-\\left(\\frac{11.18}{12}\\right)^2} = 2 \\cdot 10^8 \\cdot \\sqrt{1-0.867} = 2 \\cdot 10^8 \\cdot \\sqrt{0.133} \\approx 2 \\cdot 10^8 \\cdot 0.365 = 7.3 \\cdot 10^7$ м/с."
        },

        // Термодинамика - graduate
        {
            id: "thermodynamics-graduate-1",
            title: "Статистическая термодинамика",
            statement: "Рассмотрим одномерный гармонический осциллятор с частотой $\\omega = 10^{14}$ рад/с при температуре $T = 300$ К. Найдите среднюю энергию осциллятора, его теплоемкость и энтропию. Постоянная Больцмана $k_B = 1.38 \\cdot 10^{-23}$ Дж/К, постоянная Планка $\\hbar = 1.05 \\cdot 10^{-34}$ Дж·с.",
            difficulty: "graduate",
            topic: "thermodynamics",
            tikzCode: `
\\begin{tikzpicture}
  % Потенциальная яма осциллятора
  \\draw[thick, domain=-3:3, samples=100, smooth] plot (\\x, {\\x*\\x/2});
  \\draw[-stealth] (-3.5,0) -- (3.5,0) node[right] {$x$};
  \\draw[-stealth] (0,0) -- (0,5) node[above] {$U(x)$};
  
  % Энергетические уровни
  \\foreach \\n in {0,...,4} {
    \\draw[red, thick] (-2.5,\\n+0.5) -- (2.5,\\n+0.5) node[right] {$E_\\n = \\hbar\\omega(\\n+\\frac{1}{2})$};
  }
  
  % Волновые функции (схематично)
  \\draw[blue, smooth, samples=100, domain=-2:2] plot (\\x, {0.5+0.3*exp(-\\x*\\x/1.5)});
  \\draw[blue, smooth, samples=100, domain=-2:2] plot (\\x, {1.5+0.3*\\x*exp(-\\x*\\x/1.5)});
  \\draw[blue, smooth, samples=100, domain=-2:2] plot (\\x, {2.5+0.3*(2*\\x*\\x-1)*exp(-\\x*\\x/1.5)});
  
  % Формулы статистической физики
  \\node at (0,-1) {$Z = \\sum_{n=0}^{\\infty} e^{-\\beta E_n} = \\frac{1}{2\\sinh(\\beta\\hbar\\omega/2)}$};
  \\node at (0,-1.7) {$\\langle E \\rangle = -\\frac{\\partial}{\\partial\\beta}\\ln Z = \\frac{\\hbar\\omega}{2}\\coth(\\beta\\hbar\\omega/2)$};
  \\node at (0,-2.4) {$C_V = k_B\\beta^2 \\frac{\\partial^2}{\\partial\\beta^2}\\ln Z$};
  \\node at (0,-3.1) {$S = k_B\\ln Z + k_B\\beta\\langle E \\rangle$};
  
  % Параметр x = βℏω
  \\node at (5,2) {$x = \\frac{\\hbar\\omega}{k_B T} = \\frac{1.05 \\cdot 10^{-34} \\cdot 10^{14}}{1.38 \\cdot 10^{-23} \\cdot 300}$};
  \\node at (5,1.3) {$x \\approx 0.25$};
\\end{tikzpicture}
      `,
            solution: "Вычислим безразмерный параметр $x = \\frac{\\hbar\\omega}{k_B T} = \\frac{1.05 \\cdot 10^{-34} \\cdot 10^{14}}{1.38 \\cdot 10^{-23} \\cdot 300} \\approx 0.25$. Средняя энергия осциллятора: $\\langle E \\rangle = \\frac{\\hbar\\omega}{2}\\coth\\left(\\frac{\\hbar\\omega}{2k_B T}\\right) = \\frac{\\hbar\\omega}{2}\\coth\\left(\\frac{x}{2}\\right) = \\frac{1.05 \\cdot 10^{-34} \\cdot 10^{14}}{2}\\coth\\left(\\frac{0.25}{2}\\right)$. Вычисляем $\\coth(0.125) \\approx 8.01$, тогда $\\langle E \\rangle \\approx 5.25 \\cdot 10^{-20}$ Дж $\\approx 3.27 \\cdot 10^{-1}$ эВ. Теплоемкость: $C_V = k_B\\frac{x^2}{4\\sinh^2(x/2)} = 1.38 \\cdot 10^{-23} \\cdot \\frac{0.25^2}{4\\sinh^2(0.125)} \\approx 1.38 \\cdot 10^{-23} \\cdot 0.0625 \\cdot 15.625 \\approx 1.35 \\cdot 10^{-23}$ Дж/К. Энтропия: $S = k_B\\left[\\frac{x}{2}\\coth\\left(\\frac{x}{2}\\right) - \\ln\\left(2\\sinh\\frac{x}{2}\\right)\\right] = 1.38 \\cdot 10^{-23} \\cdot [0.125 \\cdot 8.01 - \\ln(2\\sinh(0.125))] = 1.38 \\cdot 10^{-23} \\cdot [1.00 - \\ln(0.25)] \\approx 1.38 \\cdot 10^{-23} \\cdot 2.39 = 3.30 \\cdot 10^{-23}$ Дж/К."
        },

        // Квантовая механика - graduate
        {
            id: "quantum-mechanics-graduate-1",
            title: "Прохождение через потенциальный барьер",
            statement: "Частица массой $m = 9.1 \\cdot 10^{-31}$ кг и энергией $E = 10$ эВ налетает на прямоугольный потенциальный барьер высотой $U_0 = 15$ эВ и шириной $a = 0.5$ нм. Найдите коэффициент прохождения частицы через барьер. Постоянная Планка $\\hbar = 1.05 \\cdot 10^{-34}$ Дж·с.",
            difficulty: "graduate",
            topic: "quantum-mechanics",
            tikzCode: `
\\begin{tikzpicture}
  % Оси
  \\draw[-stealth] (-0.5,0) -- (7,0) node[right] {$x$};
  \\draw[-stealth] (0,-0.5) -- (0,4) node[above] {$U(x)$};
  
  % Потенциальный барьер
  \\draw[thick] (0,0) -- (2,0);
  \\draw[thick] (2,0) -- (2,3) -- (5,3) -- (5,0);
  \\draw[thick] (5,0) -- (7,0);
  
  % Подписи к барьеру
  \\node at (3.5,3.5) {$U_0 = 15$ эВ};
  \\draw[<->] (2,-0.3) -- (5,-0.3) node[midway, below] {$a = 0.5$ нм};
  
  % Энергия частицы
  \\draw[dashed, red] (0,2) -- (7,2);
  \\node[red] at (0.7,2.3) {$E = 10$ эВ};
  
  % Волновые функции
  % Падающая и отраженная волны в области 1
  \\draw[blue, smooth, samples=100, domain=0:2] plot (\\x, {0.8*sin(10*\\x r)+1});
  % Затухающая волна внутри барьера
  \\draw[green, smooth, samples=100, domain=2:5] plot (\\x, {0.6*exp(-0.7*(\\x-2))+1});
  % Прошедшая волна в области 3
  \\draw[blue, smooth, samples=100, domain=5:7] plot (\\x, {0.3*sin(10*(\\x-5) r)+1});
  
  % Формулы
  \\node at (3.5,-1.5) {$T = \\frac{4k_1k_2}{4k_1k_2 + (k_1^2 + k_2^2)\\sinh^2(\\kappa a)}$};
  \\node at (3.5,-2.2) {$k_1 = \\frac{\\sqrt{2mE}}{\\hbar}, k_2 = \\frac{\\sqrt{2m(E-U_0)}}{\\hbar} = i\\kappa, \\kappa = \\frac{\\sqrt{2m(U_0-E)}}{\\hbar}$};
  \\node at (3.5,-2.9) {$T \\approx 16\\frac{E}{U_0}\\frac{U_0-E}{U_0}e^{-2\\kappa a}$};
\\end{tikzpicture}
      `,
            solution: "Для случая $E < U_0$ (туннельный эффект) коэффициент прохождения определяется выражением: $T = \\frac{4k_1k_2^*k_2k_1^*}{|k_1^2 + k_2^2|^2\\sinh^2(\\kappa a) + 4k_1k_1^*k_2k_2^*}$, где $k_1 = \\frac{\\sqrt{2mE}}{\\hbar}$, $k_2 = i\\kappa$, $\\kappa = \\frac{\\sqrt{2m(U_0-E)}}{\\hbar}$. Вычислим параметры: $k_1 = \\frac{\\sqrt{2 \\cdot 9.1 \\cdot 10^{-31} \\cdot 10 \\cdot 1.6 \\cdot 10^{-19}}}{1.05 \\cdot 10^{-34}} = \\frac{\\sqrt{2.91 \\cdot 10^{-48}}}{1.05 \\cdot 10^{-34}} = \\frac{5.4 \\cdot 10^{-24}}{1.05 \\cdot 10^{-34}} = 5.1 \\cdot 10^{10}$ м$^{-1}$. $\\kappa = \\frac{\\sqrt{2 \\cdot 9.1 \\cdot 10^{-31} \\cdot 5 \\cdot 1.6 \\cdot 10^{-19}}}{1.05 \\cdot 10^{-34}} = \\frac{\\sqrt{1.46 \\cdot 10^{-48}}}{1.05 \\cdot 10^{-34}} = \\frac{3.82 \\cdot 10^{-24}}{1.05 \\cdot 10^{-34}} = 3.6 \\cdot 10^{10}$ м$^{-1}$. Для тонкого барьера можно использовать приближение: $T \\approx 16\\frac{E}{U_0}\\left(1-\\frac{E}{U_0}\\right)e^{-2\\kappa a} = 16 \\cdot \\frac{10}{15} \\cdot \\frac{5}{15} \\cdot e^{-2 \\cdot 3.6 \\cdot 10^{10} \\cdot 0.5 \\cdot 10^{-9}} = 16 \\cdot \\frac{2}{9} \\cdot e^{-36} \\approx 3.56 \\cdot 10^{-16}$. Коэффициент прохождения равен $3.56 \\cdot 10^{-16}$ или около $3.6 \\cdot 10^{-14}\\%$."
        },

        // Статистическая физика - graduate
        {
            id: "statistical-physics-graduate-1",
            title: "Распределение Ферми-Дирака",
            statement: "Рассмотрим газ свободных электронов в металле при температуре $T = 300$ К. Концентрация электронов $n = 8.4 \\cdot 10^{28}$ м$^{-3}$. Найдите энергию Ферми, температуру Ферми и вероятность обнаружить электрон на энергетическом уровне на 0.1 эВ выше энергии Ферми. Постоянная Больцмана $k_B = 8.62 \\cdot 10^{-5}$ эВ/К, масса электрона $m_e = 9.1 \\cdot 10^{-31}$ кг.",
            difficulty: "graduate",
            topic: "statistical-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Оси
  \\draw[-stealth] (-0.5,0) -- (6,0) node[right] {$E$};
  \\draw[-stealth] (0,-0.5) -- (0,4) node[above] {$f(E)$};

  % Распределение Ферми-Дирака при T=0K
  \\draw[thick, blue] (0,3) -- (3,3) -- (3,0);
  \\node[blue] at (1.5,3.5) {$T = 0$ К};
  \\draw[dashed] (3,-0.2) -- (3,3);
  \\node at (3,-0.5) {$E_F$};
  
  % Распределение Ферми-Дирака при T>0K
  \\draw[thick, red, domain=0:6, samples=100] plot (\\x, {3/(1+exp((\\x-3)/0.5))});
  \\node[red] at (5,2) {$T = 300$ К};
  
  % Маркеры
  \\draw[dashed] (4,-0.2) -- (4,{3/(1+exp((4-3)/0.5))});
  \\node at (4,-0.5) {$E_F + 0.1$ эВ};
  \\draw[dotted, ->] (4.5,1) -- (4,{3/(1+exp((4-3)/0.5))});
  \\node at (5,1) {$f(E_F+0.1)$};
  
  % Формулы
  \\node at (3,-1.5) {$E_F = \\frac{\\hbar^2}{2m_e}\\left(3\\pi^2 n\\right)^{2/3}$};
  \\node at (3,-2.2) {$T_F = \\frac{E_F}{k_B}$};
  \\node at (3,-2.9) {$f(E) = \\frac{1}{e^{(E-E_F)/k_BT}+1}$};
  
  % Плотность состояний
  \\begin{scope}[xshift=8cm]
    \\draw[-stealth] (-0.5,0) -- (4,0) node[right] {$E$};
    \\draw[-stealth] (0,-0.5) -- (0,3) node[above] {$g(E)$};
    \\draw[thick, green, domain=0:4, samples=100] plot (\\x, {0.5*sqrt(\\x)});
    \\node at (2,2.5) {$g(E) \\propto \\sqrt{E}$};
    \\draw[dashed] (3,-0.2) -- (3,{0.5*sqrt(3)});
    \\node at (3,-0.5) {$E_F$};
  \\end{scope}
\\end{tikzpicture}
      `,
            solution: "Энергия Ферми для газа свободных электронов определяется формулой: $E_F = \\frac{\\hbar^2}{2m_e}\\left(3\\pi^2 n\\right)^{2/3}$. Подставляем значения: $E_F = \\frac{(1.05 \\cdot 10^{-34})^2}{2 \\cdot 9.1 \\cdot 10^{-31}} \\cdot \\left(3\\pi^2 \\cdot 8.4 \\cdot 10^{28}\\right)^{2/3} = \\frac{1.1 \\cdot 10^{-68}}{1.82 \\cdot 10^{-30}} \\cdot \\left(7.9 \\cdot 10^{29}\\right)^{2/3} = 6.05 \\cdot 10^{-38} \\cdot \\left(7.9 \\cdot 10^{29}\\right)^{2/3} = 6.05 \\cdot 10^{-38} \\cdot 3.8 \\cdot 10^{19} = 2.3 \\cdot 10^{-18}$ Дж $ = 14.4$ эВ. Температура Ферми: $T_F = \\frac{E_F}{k_B} = \\frac{14.4}{8.62 \\cdot 10^{-5}} = 1.67 \\cdot 10^5$ К. Вероятность обнаружить электрон на энергетическом уровне $E = E_F + 0.1$ эВ определяется распределением Ферми-Дирака: $f(E) = \\frac{1}{e^{(E-E_F)/k_BT}+1} = \\frac{1}{e^{0.1/(8.62 \\cdot 10^{-5} \\cdot 300)}+1} = \\frac{1}{e^{3.87}+1} = \\frac{1}{48.4} = 0.021$ или примерно $2.1\\%$."
        },

        // Астрофизика - graduate
        {
            id: "astrophysics-graduate-1",
            title: "Модель звезды Эддингтона",
            statement: "Рассмотрите модель звезды в лучистом равновесии с массой $M = 2 \\cdot 10^{30}$ кг, радиусом $R = 7 \\cdot 10^8$ м и постоянной непрозрачностью $\\kappa = 0.4$ м²/кг. Оцените центральное давление, центральную температуру и светимость звезды. Считайте, что звезда находится в гидростатическом равновесии и переносит энергию излучением. Постоянная Стефана-Больцмана $\\sigma = 5.67 \\cdot 10^{-8}$ Вт/(м²·К⁴), постоянная излучения $a = 7.56 \\cdot 10^{-16}$ Дж/(м³·К⁴), гравитационная постоянная $G = 6.67 \\cdot 10^{-11}$ м³/(кг·с²).",
            difficulty: "graduate",
            topic: "astrophysics",
            tikzCode: `
\\begin{tikzpicture}
  % Координаты центра звезды
  \\def\\cx{0}
  \\def\\cy{0}
  \\def\\R{3} % Радиус звезды
  
  % Звезда (круг)
  \\filldraw[yellow!20] (\\cx,\\cy) circle (\\R);
  \\draw[thick] (\\cx,\\cy) circle (\\R);
  
  % Градиент температуры и давления
  \\foreach \\r in {0,0.5,...,2.5} {
    \\pgfmathsetmacro{\\opacity}{1-\\r/3}
    \\pgfmathsetmacro{\\temp}{100-\\r*30}
    \\filldraw[red!\\temp!yellow!80, opacity=\\opacity] (\\cx,\\cy) circle (\\R-\\r);
  }
  
  % Лучи энергии (схематично)
  \\foreach \\ang in {0,30,...,330} {
    \\draw[-stealth, yellow!80!red, thick] (\\cx,\\cy) -- ++({\\R*cos(\\ang)},{\\R*sin(\\ang)});
  }
  
  % Подписи
  \\draw[-stealth] (\\cx,\\cy) -- (\\cx+\\R+0.5,\\cy) node[right] {$R$};
  
  % Структура звезды
  \\begin{scope}[xshift=8cm]
    % Оси
    \\draw[-stealth] (0,0) -- (5,0) node[right] {$r/R$};
    \\draw[-stealth] (0,0) -- (0,4) node[above] {Относительные величины};
    
    % Графики
    \\draw[thick, blue, domain=0:4.5, samples=50] plot (\\x, {3*exp(-\\x)});
    \\draw[thick, red, domain=0:4.5, samples=50] plot (\\x, {2.5*exp(-0.8*\\x)});
    \\draw[thick, green, domain=0:4.5, samples=50] plot (\\x, {1.5*exp(-0.6*\\x)});
    
    % Подписи к графикам
    \\node[blue] at (4.7,2) {$P(r)$};
    \\node[red] at (4.7,1.5) {$T(r)$};
    \\node[green] at (4.7,1) {$\\rho(r)$};
    
    % Отметки
    \\draw[dashed] (4,0) -- (4,0.2);
    \\node at (4,-0.3) {1};
  \\end{scope}
  
  % Формулы
  \\node at (0,-4.5) {$\\frac{dP}{dr} = -\\frac{G M(r) \\rho(r)}{r^2}$};
  \\node at (0,-5.2) {$\\frac{dT}{dr} = -\\frac{3\\kappa\\rho(r)L(r)}{16\\pi acr^2T^3(r)}$};
  \\node at (0,-5.9) {$P_c \\approx \\frac{2\\pi G}{3}\\left(\\frac{3M}{4\\pi R^3}\\right)^2R^2$};
  \\node at (0,-6.6) {$T_c^4 \\approx \\frac{3\\kappa L M}{16\\pi acR^3}$};
\\end{tikzpicture}
      `,
            solution: "Центральное давление в модели Эддингтона можно оценить, используя уравнение гидростатического равновесия и предположение о постоянной плотности: $P_c \\approx \\frac{2\\pi G}{3}\\left(\\frac{3M}{4\\pi R^3}\\right)^2R^2$. Подставляем значения: $P_c \\approx \\frac{2\\pi \\cdot 6.67 \\cdot 10^{-11}}{3}\\left(\\frac{3 \\cdot 2 \\cdot 10^{30}}{4\\pi \\cdot (7 \\cdot 10^8)^3}\\right)^2 \\cdot (7 \\cdot 10^8)^2 = 1.4 \\cdot 10^{-10} \\cdot \\left(\\frac{6 \\cdot 10^{30}}{1.37 \\cdot 10^{27}}\\right)^2 \\cdot 4.9 \\cdot 10^{17} = 1.4 \\cdot 10^{-10} \\cdot (4.38 \\cdot 10^3)^2 \\cdot 4.9 \\cdot 10^{17} = 1.4 \\cdot 10^{-10} \\cdot 1.92 \\cdot 10^7 \\cdot 4.9 \\cdot 10^{17} = 1.32 \\cdot 10^{15}$ Па. Центральная температура из условия лучистого равновесия: $T_c^4 \\approx \\frac{3\\kappa L M}{16\\pi acR^3}$. Выразим светимость из радиационного переноса энергии: $L \\approx \\frac{4\\pi acG}{\\kappa}\\frac{MT_c^4}{P_c}$. Подставляя выражение для $P_c$, получим: $T_c^8 \\approx \\frac{9\\kappa \\cdot 4\\pi acG M^2}{16\\pi ac \\cdot 3} \\cdot \\frac{3}{2\\pi G} \\cdot \\left(\\frac{4\\pi R^3}{3M}\\right)^2 \\cdot \\frac{1}{R^5} = \\frac{6\\kappa GM}{\\pi a} \\cdot \\frac{1}{R^4}$. Откуда: $T_c \\approx \\left(\\frac{6\\kappa GM}{\\pi a R^4}\\right)^{1/8} = \\left(\\frac{6 \\cdot 0.4 \\cdot 6.67 \\cdot 10^{-11} \\cdot 2 \\cdot 10^{30}}{\\pi \\cdot 7.56 \\cdot 10^{-16} \\cdot (7 \\cdot 10^8)^4}\\right)^{1/8} = (2.16 \\cdot 10^{26})^{1/8} \\approx 5.4 \\cdot 10^6$ К. Светимость звезды можно определить, используя закон Стефана-Больцмана для эффективной температуры поверхности: $L = 4\\pi R^2 \\sigma T_{eff}^4$. Для определения $T_{eff}$ можно использовать соотношение: $T_{eff}^4 \\approx \\frac{T_c^4}{\\tau}$, где $\\tau \\approx \\kappa \\frac{M}{4\\pi R^2} = 0.4 \\cdot \\frac{2 \\cdot 10^{30}}{4\\pi \\cdot (7 \\cdot 10^8)^2} = 0.4 \\cdot \\frac{2 \\cdot 10^{30}}{5.54 \\cdot 10^{18}} = 0.4 \\cdot 3.61 \\cdot 10^{11} = 1.44 \\cdot 10^{11}$. Тогда $T_{eff} \\approx \\frac{T_c}{\\tau^{1/4}} = \\frac{5.4 \\cdot 10^6}{(1.44 \\cdot 10^{11})^{1/4}} = \\frac{5.4 \\cdot 10^6}{84.5} \\approx 6.4 \\cdot 10^4$ К. Светимость: $L = 4\\pi \\cdot (7 \\cdot 10^8)^2 \\cdot 5.67 \\cdot 10^{-8} \\cdot (6.4 \\cdot 10^4)^4 = 4\\pi \\cdot 4.9 \\cdot 10^{17} \\cdot 5.67 \\cdot 10^{-8} \\cdot 1.68 \\cdot 10^{18} = 1.83 \\cdot 10^{37}$ Вт, что примерно равно $4.8 \\cdot 10^{10} L_{\\odot}$ (солнечных светимостей)."
        },

        // Релятивистская физика - graduate
        {
            id: "relativistic-physics-graduate-1",
            title: "Эффект Доплера в специальной теории относительности",
            statement: "Источник испускает фотоны с частотой $\\nu_0 = 5 \\cdot 10^{14}$ Гц в системе отсчета источника. Источник движется от наблюдателя со скоростью $v = 0.8c$. Найдите частоту фотонов, регистрируемых наблюдателем. Скорость света $c = 3 \\cdot 10^8$ м/с.",
            difficulty: "graduate",
            topic: "relativistic-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Координатные оси
  \\draw[-stealth] (-0.5,0) -- (8,0) node[right] {$x$};
  \\draw[-stealth] (0,-0.5) -- (0,3) node[above] {$t$};
  
  % Мировая линия наблюдателя
  \\draw[thick, blue] (0,0) -- (0,3);
  \\node[blue] at (0.7,2.8) {наблюдатель};
  
  % Мировая линия источника
  \\draw[thick, red] (0,0) -- (2.4,3);
  \\node[red] at (2.4,3.3) {источник};
  
  % Световые сигналы (фотоны)
  \\draw[snake=snake, orange, thick] (0,0) -- (3,3);
  \\draw[snake=snake, orange, thick] (0.8,1) -- (3.8,4);
  \\draw[snake=snake, orange, thick] (1.6,2) -- (4.6,5);
  
  % Системы отсчета
  \\draw[stealth-stealth, dashed] (0,1) -- (0.8,1);
  \\node at (0.4,1.2) {$t'$};
  \\draw[stealth-stealth, dashed] (1.6,2) -- (2.4,2);
  \\node at (2,2.2) {$t'$};
  
  % Пространство-время события
  \\begin{scope}[xshift=10cm]
    % Гиперболы постоянных интервалов
    \\draw[gray, domain=0:4, samples=50] plot (\\x, {sqrt(1+\\x*\\x)});
    \\draw[gray, domain=0:4, samples=50] plot (\\x, {-sqrt(1+\\x*\\x)});
    
    % Световой конус
    \\draw[orange, thick] (0,0) -- (4,4);
    \\draw[orange, thick] (0,0) -- (4,-4);
    \\draw[orange, thick] (0,0) -- (-4,4);
    \\draw[orange, thick] (0,0) -- (-4,-4);
    
    % Оси системы отсчета K
    \\draw[-stealth] (-4,0) -- (4,0) node[right] {$x$};
    \\draw[-stealth] (0,-4) -- (0,4) node[above] {$ct$};
    
    % Оси системы отсчета K' (движущейся)
    \\draw[-stealth, red] (0,0) -- (3.2,2.4) node[right] {$x'$};
    \\draw[-stealth, red] (0,0) -- (2.4,3.2) node[above] {$ct'$};
    
    % Штрихи на осях
    \\foreach \\i in {1,2,3} {
      \\draw (\\i,0.1) -- (\\i,-0.1) node[below] {\\i};
      \\draw (0.1,\\i) -- (-0.1,\\i) node[left] {\\i};
    }
  \\end{scope}
  
  % Формулы
  \\node at (4,-1) {$\\nu = \\nu_0 \\gamma(1-\\beta\\cos\\theta)$};
  \\node at (4,-1.7) {$\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}}$};
  \\node at (4,-2.4) {$\\beta = \\frac{v}{c}$};
  \\node at (4,-3.1) {$\\cos\\theta = 1$ (удаление)};
\\end{tikzpicture}
      `,
            solution: "По релятивистской формуле эффекта Доплера для фотонов, частота в системе наблюдателя связана с частотой в системе источника соотношением: $\\nu = \\nu_0 \\gamma(1-\\beta\\cos\\theta)$, где $\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}}$,$\\beta = \\frac{v}{c}$, $\\theta$ - угол между направлением движения источника и направлением на наблюдателя. В нашем случае источник удаляется от наблюдателя, поэтому $\\cos\\theta = 1$. Подставляем значения: $\\beta = \\frac{0.8c}{c} = 0.8$, $\\gamma = \\frac{1}{\\sqrt{1-0.8^2}} = \\frac{1}{\\sqrt{0.36}} = \\frac{1}{0.6} = \\frac{5}{3}$. Частота, регистрируемая наблюдателем: $\\nu = \\nu_0 \\cdot \\frac{5}{3} \\cdot (1-0.8 \\cdot 1) = 5 \\cdot 10^{14} \\cdot \\frac{5}{3} \\cdot 0.2 = 5 \\cdot 10^{14} \\cdot \\frac{1}{3} = 1.67 \\cdot 10^{14}$ Гц. Наблюдатель зарегистрирует красное смещение частоты фотонов из-за удаления источника."
        },

        // Физика твердого тела - graduate
        {
            id: "solid-state-physics-graduate-1",
            title: "Зонная структура полупроводника",
            statement: "Рассмотрите полупроводник с запрещенной зоной $E_g = 1.1$ эВ при температуре $T = 300$ К. Эффективная масса электронов в зоне проводимости $m_e^* = 0.2m_0$, эффективная масса дырок в валентной зоне $m_h^* = 0.3m_0$, где $m_0 = 9.1 \\cdot 10^{-31}$ кг - масса свободного электрона. Найдите концентрацию собственных носителей заряда. Постоянная Планка $\\hbar = 1.05 \\cdot 10^{-34}$ Дж·с, постоянная Больцмана $k_B = 8.62 \\cdot 10^{-5}$ эВ/К.",
            difficulty: "graduate",
            topic: "solid-state-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Оси
  \\draw[-stealth] (-3,0) -- (3,0) node[right] {$k$};
  \\draw[-stealth] (0,-1) -- (0,5) node[above] {$E$};
  
  % Зона проводимости (параболическая)
  \\draw[thick, blue, domain=-2.5:2.5, samples=100] plot (\\x, {2 + 0.5*\\x*\\x});
  \\node[blue] at (2.5,4) {Зона проводимости};
  \\node at (2.5,3.4) {$E_c(k) = E_c + \\frac{\\hbar^2k^2}{2m_e^*}$};
  
  % Запрещенная зона
  \\draw[decorate, decoration={brace, mirror}, thick] (3.2,0) -- (3.2,2) node[midway, right] {$E_g = 1.1$ эВ};
  
  % Валентная зона (параболическая вниз)
  \\draw[thick, red, domain=-2.5:2.5, samples=100] plot (\\x, {0 - 0.3*\\x*\\x});
  \\node[red] at (-2.5,-0.7) {Валентная зона};
  \\node at (-2.5,-1.3) {$E_v(k) = E_v - \\frac{\\hbar^2k^2}{2m_h^*}$};
  
  % Уровень Ферми
  \\draw[dashed] (-3,1) -- (3,1);
  \\node at (-1.5,1.2) {$E_F$};
  
  % Распределение носителей
  \\begin{scope}[xshift=7cm]
    % Оси
    \\draw[-stealth] (0,0) -- (5,0) node[right] {$E$};
    \\draw[-stealth] (0,0) -- (0,4) node[above] {$f(E), D(E)$};
    
    % Плотность состояний
    \\draw[green, thick, domain=2:5, samples=100] plot (\\x, {sqrt(\\x-2)});
    \\draw[green, thick, domain=0:2, samples=100] plot (\\x, {sqrt(2-\\x)});
    \\node[green] at (4,3) {$D(E)$};
    
    % Функция Ферми-Дирака
    \\draw[blue, thick, domain=0:5, samples=100] plot (\\x, {3/(1+exp((\\x-2.5)/0.5))});
    \\node[blue] at (1,3) {$f(E)$};
    
    % Концентрация носителей (схематично)
    \\fill[orange, opacity=0.3] (2,0) -- plot[domain=2:5, samples=50] (\\x, {3*sqrt(\\x-2)/(1+exp((\\x-2.5)/0.5))}) -- (5,0) -- cycle;
    \\fill[orange, opacity=0.3] (0,0) -- plot[domain=0:2, samples=50] (\\x, {3*sqrt(2-\\x)/(1+exp((2.5-\\x)/0.5))}) -- (2,0) -- cycle;
    
    % Обозначения зон
    \\draw[dashed] (2,0) -- (2,3);
    \\node at (1,0.3) {Валентная зона};
    \\node at (3.5,0.3) {Зона проводимости};
  \\end{scope}
  
  % Формулы
  \\node at (0,-2.3) {$n_i = \\sqrt{N_c N_v} \\cdot e^{-E_g/2k_BT}$};
  \\node at (0,-3) {$N_c = 2\\left(\\frac{2\\pi m_e^* k_BT}{h^2}\\right)^{3/2}$};
  \\node at (0,-3.7) {$N_v = 2\\left(\\frac{2\\pi m_h^* k_BT}{h^2}\\right)^{3/2}$};
\\end{tikzpicture}
      `,
            solution: "Концентрация собственных носителей заряда в полупроводнике определяется формулой: $n_i = \\sqrt{N_c N_v} \\cdot e^{-E_g/2k_BT}$, где $N_c$ и $N_v$ - эффективная плотность состояний в зоне проводимости и валентной зоне соответственно. Вычислим $N_c$: $N_c = 2\\left(\\frac{2\\pi m_e^* k_BT}{h^2}\\right)^{3/2} = 2\\left(\\frac{2\\pi \\cdot 0.2 \\cdot 9.1 \\cdot 10^{-31} \\cdot 8.62 \\cdot 10^{-5} \\cdot 1.6 \\cdot 10^{-19} \\cdot 300}{(6.63 \\cdot 10^{-34})^2}\\right)^{3/2} = 2 \\cdot \\left(\\frac{2\\pi \\cdot 1.82 \\cdot 10^{-31} \\cdot 4.14 \\cdot 10^{-21}}{4.4 \\cdot 10^{-67}}\\right)^{3/2} = 2 \\cdot (5.43 \\cdot 10^{16})^{3/2} = 2 \\cdot 4.0 \\cdot 10^{24} = 8.0 \\cdot 10^{24}$ м$^{-3}$. Аналогично для $N_v$: $N_v = 2\\left(\\frac{2\\pi m_h^* k_BT}{h^2}\\right)^{3/2} = 2\\left(\\frac{2\\pi \\cdot 0.3 \\cdot 9.1 \\cdot 10^{-31} \\cdot 8.62 \\cdot 10^{-5} \\cdot 1.6 \\cdot 10^{-19} \\cdot 300}{(6.63 \\cdot 10^{-34})^2}\\right)^{3/2} = 2 \\cdot \\left(\\frac{2\\pi \\cdot 2.73 \\cdot 10^{-31} \\cdot 4.14 \\cdot 10^{-21}}{4.4 \\cdot 10^{-67}}\\right)^{3/2} = 2 \\cdot (8.15 \\cdot 10^{16})^{3/2} = 2 \\cdot 7.36 \\cdot 10^{24} = 1.47 \\cdot 10^{25}$ м$^{-3}$. Вычислим множитель Больцмана: $e^{-E_g/2k_BT} = e^{-1.1/(2 \\cdot 8.62 \\cdot 10^{-5} \\cdot 300)} = e^{-1.1/0.05172} = e^{-21.27} = 5.78 \\cdot 10^{-10}$. Тогда концентрация собственных носителей: $n_i = \\sqrt{8.0 \\cdot 10^{24} \\cdot 1.47 \\cdot 10^{25}} \\cdot 5.78 \\cdot 10^{-10} = \\sqrt{1.18 \\cdot 10^{50}} \\cdot 5.78 \\cdot 10^{-10} = 1.09 \\cdot 10^{25} \\cdot 5.78 \\cdot 10^{-10} = 6.3 \\cdot 10^{15}$ м$^{-3}$ или $6.3 \\cdot 10^9$ см$^{-3}$."
        },

        // Физика элементарных частиц - graduate
        {
            id: "particle-physics-graduate-1",
            title: "Распад нейтрального пиона",
            statement: "Нейтральный пион $\\pi^0$ с энергией $E_{\\pi} = 1$ ГэВ распадается на два фотона: $\\pi^0 \\rightarrow \\gamma + \\gamma$. Найдите энергии и углы вылета фотонов в лабораторной системе отсчета. Масса покоя нейтрального пиона $m_{\\pi} = 135$ МэВ/c².",
            difficulty: "graduate",
            topic: "particle-physics",
            tikzCode: `
\\begin{tikzpicture}
  % Система координат
  \\draw[-stealth] (-0.5,0) -- (5,0) node[right] {$z$};
  \\draw[-stealth] (0,-0.5) -- (0,3) node[above] {$y$};
  
  % Движение пиона
  \\draw[-stealth, very thick, orange] (0,0) -- (3,0) node[above right] {$\\pi^0$};
  
  % Распад
  \\draw[stealth-stealth, thick, decorate, decoration={snake, amplitude=.4mm, segment length=2mm}] (3,0) -- (5,1.5) node[right] {$\\gamma_1$};
  \\draw[stealth-stealth, thick, decorate, decoration={snake, amplitude=.4mm, segment length=2mm}] (3,0) -- (5,-1) node[right] {$\\gamma_2$};
  
  % Углы вылета
  \\draw[dashed] (3,0) -- (5,0);
  \\draw[<->, red] (4.2,0) arc (0:33.7:1.2) node[midway, right] {$\\theta_1$};
  \\draw[<->, red] (4.2,0) arc (0:-18.4:1.2) node[midway, right] {$\\theta_2$};
  
  % СЦМ пиона
  \\begin{scope}[xshift=8cm]
    \\draw[-stealth] (-1.5,0) -- (1.5,0) node[right] {$z^*$};
    \\draw[-stealth] (0,-1.5) -- (0,1.5) node[above] {$y^*$};
    
    % Распад в СЦМ
    \\draw[orange, fill=orange] (0,0) circle (0.1) node[right] {$\\pi^0$};
    \\draw[stealth-stealth, thick, decorate, decoration={snake, amplitude=.4mm, segment length=2mm}] (0,0) -- (1.3,0) node[right] {$\\gamma_1^*$};
    \\draw[stealth-stealth, thick, decorate, decoration={snake, amplitude=.4mm, segment length=2mm}] (0,0) -- (-1.3,0) node[left] {$\\gamma_2^*$};
    
    % Импульсы
    \\node at (0,-2) {$|\\vec{p}_1^*| = |\\vec{p}_2^*| = \\frac{m_{\\pi}c}{2}$};
  \\end{scope}
  
  % Формулы
  \\node at (4,-2.5) {$E_1 = \\frac{m_{\\pi}c^2}{2}\\gamma(1+\\beta\\cos\\theta^*)$};
  \\node at (4,-3.2) {$E_2 = \\frac{m_{\\pi}c^2}{2}\\gamma(1-\\beta\\cos\\theta^*)$};
  \\node at (4,-3.9) {$\\cos\\theta_1 = \\frac{\\cos\\theta^* + \\beta}{1 + \\beta\\cos\\theta^*}$};
  \\node at (4,-4.6) {$\\cos\\theta_2 = \\frac{\\cos(\\pi-\\theta^*) + \\beta}{1 + \\beta\\cos(\\pi-\\theta^*)}$};
\\end{tikzpicture}
      `,
            solution: "Решаем задачу в двух системах отсчета - лабораторной и системе центра масс (СЦМ) пиона. В СЦМ фотоны разлетаются в противоположных направлениях с одинаковыми энергиями $E_1^* = E_2^* = \\frac{m_{\\pi}c^2}{2} = \\frac{135}{2} = 67.5$ МэВ. Для перехода в лабораторную систему вычислим релятивистские параметры пиона: $\\gamma = \\frac{E_{\\pi}}{m_{\\pi}c^2} = \\frac{1000}{135} = 7.41$, $\\beta = \\sqrt{1-\\frac{1}{\\gamma^2}} = \\sqrt{1-\\frac{1}{7.41^2}} = \\sqrt{1-0.018} = \\sqrt{0.982} = 0.991$. Рассмотрим случай, когда в СЦМ один фотон вылетает вдоль направления движения пиона ($\\theta^* = 0$), а другой - против ($\\theta^* = \\pi$). Тогда энергии фотонов в лабораторной системе: $E_1 = \\frac{m_{\\pi}c^2}{2}\\gamma(1+\\beta) = 67.5 \\cdot 7.41 \\cdot (1+0.991) = 67.5 \\cdot 7.41 \\cdot 1.991 = 67.5 \\cdot 14.75 = 995$ МэВ. $E_2 = \\frac{m_{\\pi}c^2}{2}\\gamma(1-\\beta) = 67.5 \\cdot 7.41 \\cdot (1-0.991) = 67.5 \\cdot 7.41 \\cdot 0.009 = 67.5 \\cdot 0.067 = 4.5$ МэВ. Проверим закон сохранения энергии: $E_1 + E_2 = 995 + 4.5 = 999.5 \\approx 1000 = E_{\\pi}$ МэВ. Углы вылета фотонов в лабораторной системе определяются формулами релятивистского преобразования углов: $\\cos\\theta_1 = \\frac{\\cos\\theta^* + \\beta}{1 + \\beta\\cos\\theta^*} = \\frac{1 + 0.991}{1 + 0.991 \\cdot 1} = \\frac{1.991}{1.991} = 1$, откуда $\\theta_1 = 0$. $\\cos\\theta_2 = \\frac{\\cos\\pi + \\beta}{1 + \\beta\\cos\\pi} = \\frac{-1 + 0.991}{1 + 0.991 \\cdot (-1)} = \\frac{-0.009}{0.009} = -1$, откуда $\\theta_2 = 180^{\\circ}$. Таким образом, в лабораторной системе отсчета фотоны вылетают вдоль оси движения пиона с энергиями 995 МэВ и 4.5 МэВ соответственно."
        },
    ]


    public generateProblem(topic: string, diff: string): PhysicsProblem {
        return <PhysicsProblem>this.problemsDatabase.find(problem => problem.difficulty === diff && problem.topic === topic);
    }
}
