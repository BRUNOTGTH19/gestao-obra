import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.vfs

interface Funcionario {
  nome: string
  telefone: string
  profissao: string
  valorDiaria: number
  diasTrabalhados: number
  tipoContrato: string
  datasTrabalhadas?: string[]
}

interface Gasto {
  categoria: string
  valor: number
  descricao: string
  dataGasto: string
}

interface OrcamentoItem {
  descricao: string
  quantidade: number
  valorUnitario: number
  dataCompra: string
}

export function gerarPDFFuncionarios(funcionarios: Funcionario[]) {
  const totalGeral = funcionarios.reduce((acc, f) => acc + (f.valorDiaria * f.diasTrabalhados), 0)

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    header: function() {
      return { text: 'Relatório de Funcionários', style: 'header' }
    },
    footer: function(currentPage: number, pageCount: number) {
      return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 20, 0, 0] }
    },
    content: [
      {
        text: `Total Geral de Diárias: R$ ${totalGeral.toFixed(2)}`,
        style: 'total'
      },
      {
        text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        style: 'data',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 70, 45, 70, 'auto'],
          body: [
            [
              { text: 'Nome / Profissão', style: 'tableHeader' },
              { text: 'Diária (R$)', style: 'tableHeader' },
              { text: 'Dias', style: 'tableHeader' },
              { text: 'Total (R$)', style: 'tableHeader' },
              { text: 'Contrato', style: 'tableHeader' }
            ],
            ...funcionarios.map(f => {
              const total = f.valorDiaria * f.diasTrabalhados
              return [
                `${f.nome}\n${f.profissao}`,
                f.valorDiaria.toFixed(2),
                f.diasTrabalhados.toString(),
                total.toFixed(2),
                f.tipoContrato
              ]
            })
          ]
        }
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
      total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 0, 0, 5] },
      data: { fontSize: 10, color: '#666', alignment: 'right', margin: [0, 0, 0, 10] },
      tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#f59e0b' }
    }
  }

  pdfMake.createPdf(docDefinition as any).download(`funcionarios_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function gerarPDFGastos(gastos: Gasto[]) {
  const totalGeral = gastos.reduce((acc, g) => acc + g.valor, 0)

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    header: function() {
      return { text: 'Relatório de Gastos', style: 'header' }
    },
    footer: function(currentPage: number, pageCount: number) {
      return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 20, 0, 0] }
    },
    content: [
      {
        text: `Total Geral de Gastos: R$ ${totalGeral.toFixed(2)}`,
        style: 'total'
      },
      {
        text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        style: 'data',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 70],
          body: [
            [
              { text: 'Data', style: 'tableHeader' },
              { text: 'Categoria / Descrição', style: 'tableHeader' },
              { text: 'Valor (R$)', style: 'tableHeader' }
            ],
            ...gastos.map(g => [
              new Date(g.dataGasto).toLocaleDateString('pt-BR'),
              `${g.categoria}${g.descricao ? ': ' + g.descricao : ''}`,
              g.valor.toFixed(2)
            ])
          ]
        }
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
      total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 0, 0, 5] },
      data: { fontSize: 10, color: '#666', alignment: 'right', margin: [0, 0, 0, 10] },
      tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#f59e0b' }
    }
  }

  pdfMake.createPdf(docDefinition as any).download(`gastos_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function gerarPDFOrcamentoManual(itens: OrcamentoItem[]) {
  const totalGeral = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    header: function() {
      return { text: 'Relatório de Orçamento Manual', style: 'header' }
    },
    footer: function(currentPage: number, pageCount: number) {
      return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 20, 0, 0] }
    },
    content: [
      {
        text: `Total Geral: R$ ${totalGeral.toFixed(2)}`,
        style: 'total'
      },
      {
        text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        style: 'data',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Descrição', style: 'tableHeader' },
              { text: 'Qtd', style: 'tableHeader' },
              { text: 'Valor Unit. (R$)', style: 'tableHeader' },
              { text: 'Subtotal (R$)', style: 'tableHeader' }
            ],
            ...itens.map(item => [
              `${item.descricao}\n${new Date(item.dataCompra).toLocaleDateString('pt-BR')}`,
              item.quantidade.toString(),
              item.valorUnitario.toFixed(2),
              (item.quantidade * item.valorUnitario).toFixed(2)
            ])
          ]
        }
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
      total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 0, 0, 5] },
      data: { fontSize: 10, color: '#666', alignment: 'right', margin: [0, 0, 0, 10] },
      tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#f59e0b' }
    }
  }

  pdfMake.createPdf(docDefinition as any).download(`orcamento_manual_${new Date().toISOString().split('T')[0]}.pdf`)
}