import { Request, Response } from 'express';

export const getExample = (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello from example controller!' });
};

export const postExample = (req: Request, res: Response) => {
    const data = req.body;
    res.status(201).json({ message: 'Data received', data });
};