# Minério em deflação, aço atrás de muros

Site de resolução da **Atividade Conjunta Macro + Fundamentalista** — tese de investimento
integrada sobre o setor de **Mineração & Siderurgia**, comparando **Vale (VALE3)** e
**Gerdau (GGBR4)**.

## A tese, em uma frase

O volume de minério deixa de gerar valor (Simandou + demanda chinesa em declínio empurram o
preço para US$ 85–105/t), enquanto o aço regionalizado atrás de barreiras tarifárias (EUA 50%,
Brasil 25%, CBAM na UE) absorve o valor que sai da matéria-prima. Recomendação: **VALE3 —
MANTER** (ativo de renda), **GGBR4 — COMPRAR** (ativo de posicionamento).

## Estrutura do site

| Seção | Conteúdo |
|---|---|
| 00 · Resumo executivo | A tese em três movimentos |
| 01 · Tese macro | Simandou, curva de custo, China, muralha tarifária, Brasil |
| 02 · Análise fundamentalista | Vale, Gerdau e comparativo — dados do 2T26 |
| 03 · Simulador | Teste de sensibilidade interativo com premissas abertas |
| 04 · Conclusão | Tese única, recomendações e evolução até 2030 |
| 05 · Riscos | Matriz probabilidade × impacto |
| 06 · Fontes | Todas as referências utilizadas |

## Arquivos

```
index.html              relatório completo
assets/css/style.css    tema escuro, sem framework
assets/js/app.js        gráficos SVG, abas, scroll-spy e simulador
```

## Notas técnicas

- **Zero dependências.** Nenhuma biblioteca, CDN ou build. Basta abrir o `index.html`.
- **Gráficos em SVG puro**, gerados em JavaScript e re-renderizados no *resize*, com tooltip
  em todos eles e layout alternativo para telas estreitas.
- **Paleta de dados validada** para daltonismo (deuteranopia/protanopia/tritanopia) contra a
  superfície escura: azul `#3987e5` (Vale), laranja `#d95926` (Gerdau), verde-água `#199e70`.
  A identidade da série nunca depende só da cor — há legenda e rótulo direto em todos os gráficos.
- **Acessibilidade:** navegação por teclado nas abas, link de pular para o conteúdo, foco
  visível, matriz de risco duplicada em lista para leitores de tela e respeito a
  `prefers-reduced-motion`.
- **Responsivo** de 390 px a desktop, sem rolagem horizontal.

## Sobre os dados

Todos os números vêm de fontes públicas consultadas em setembro de 2026 e estão linkados na
seção 06 do site. Onde um valor é estimativa do autor — a curva de custo ilustrativa, o rateio
das "demais operações" da Gerdau e as fórmulas do simulador — isso está declarado no próprio
gráfico ou no bloco de premissas.

> **Aviso.** Trabalho acadêmico, com finalidade didática. Não é recomendação de investimento
> nem análise regulada pela CVM.

---

<sub>Repositório `html-css` — também usado para o trabalho do encontro cultural.</sub>
