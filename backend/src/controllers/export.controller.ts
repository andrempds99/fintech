import { Request, Response, NextFunction } from 'express';
import transactionRepository from '../repositories/transaction.repository';
import accountRepository from '../repositories/account.repository';
import { AppError } from '../middleware/error.middleware';
import PDFDocument from 'pdfkit';

export class ExportController {
  async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { dateFrom, dateTo } = req.query;
      const userId = req.user.userId;

      // Get user's accounts
      const accounts = await accountRepository.findByUserId(userId);
      const accountIds = accounts.map(acc => acc.id);

      if (accountIds.length === 0) {
        throw new AppError('No accounts found', 404);
      }

      // Get transactions
      const filters: any = {
        account_ids: accountIds,
      };

      if (dateFrom) {
        filters.start_date = new Date(dateFrom as string);
      }
      if (dateTo) {
        filters.end_date = new Date(dateTo as string);
      }

      const transactions = await transactionRepository.findWithFilters(filters);

      // Create CSV
      const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Status', 'Account'];
      const rows = transactions.map(txn => {
        const account = accounts.find(acc => acc.id === txn.account_id);
        return [
          new Date(txn.date).toLocaleDateString('en-US'),
          txn.merchant,
          txn.category,
          txn.amount.toString(),
          txn.status,
          account?.name || 'Unknown',
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const filename = `transactions_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  async exportPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { dateFrom, dateTo } = req.query;
      const userId = req.user.userId;

      // Get user's accounts
      const accounts = await accountRepository.findByUserId(userId);
      const accountIds = accounts.map(acc => acc.id);

      if (accountIds.length === 0) {
        throw new AppError('No accounts found', 404);
      }

      // Get transactions
      const filters: any = {
        account_ids: accountIds,
      };

      if (dateFrom) {
        filters.start_date = new Date(dateFrom as string);
      }
      if (dateTo) {
        filters.end_date = new Date(dateTo as string);
      }

      const transactions = await transactionRepository.findWithFilters(filters);

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `transactions_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Transaction Statement', { align: 'center' });
      doc.moveDown();
      
      if (dateFrom || dateTo) {
        doc.fontSize(12).text(
          `Period: ${dateFrom ? new Date(dateFrom as string).toLocaleDateString() : 'Start'} - ${dateTo ? new Date(dateTo as string).toLocaleDateString() : 'End'}`,
          { align: 'center' }
        );
        doc.moveDown();
      }

      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Table header
      const tableTop = doc.y;
      const itemHeight = 20;
      let y = tableTop;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Date', 50, y);
      doc.text('Merchant', 120, y);
      doc.text('Category', 250, y);
      doc.text('Amount', 350, y, { width: 100, align: 'right' });
      doc.text('Status', 460, y);

      y += itemHeight;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 5;

      // Table rows
      doc.font('Helvetica');
      let total = 0;

      transactions.forEach((txn) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const account = accounts.find(acc => acc.id === txn.account_id);
        const date = new Date(txn.date).toLocaleDateString('en-US');
        const amount = parseFloat(txn.amount.toString());
        total += amount;

        doc.fontSize(9);
        doc.text(date, 50, y, { width: 70 });
        doc.text(txn.merchant.substring(0, 30), 120, y, { width: 130 });
        doc.text(txn.category, 250, y, { width: 100 });
        doc.text(`$${amount.toFixed(2)}`, 350, y, { width: 100, align: 'right' });
        doc.text(txn.status, 460, y, { width: 90 });

        y += itemHeight;
      });

      // Total
      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Total: $${total.toFixed(2)}`, 350, y, { width: 100, align: 'right' });

      doc.end();
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();

