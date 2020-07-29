import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Saldo insuficiente', 400);
    }

    let categoryExist = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      categoryExist = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryExist);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryExist,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
