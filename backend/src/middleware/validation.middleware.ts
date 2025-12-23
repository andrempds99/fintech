import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './error.middleware';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(
          errors.array().map((e) => e.msg).join(', '),
          400
        ));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

