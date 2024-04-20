import { Request, Response } from 'express';

import { AppDataSource } from '../..';
import { Task } from './tasks.entity';
import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer';
import { validationResult } from 'express-validator';
import { UpdateResult } from 'typeorm';

class TasksController {
    public async getAll(
        req: Request,
        res: Response,
    ): Promise<Response> {
        // Declare a variable to hold all tasks
        let allTasks: Task[];

        // Fetch all tasks using the repository
        try {
            allTasks = await AppDataSource.getRepository(
                Task,
            ).find({
                order: { date: 'ASC' },
            });

            // Convert the tasks insstance to an array of objects
            allTasks = instanceToPlain(allTasks) as Task[];

            return res.json(allTasks).status(200);
        } catch (_errors) {
            return res
                .json({ error: 'Internal Server Error ' })
                .status(500);
        }
    }

    // Method for the post route
    public async create(
        req: Request,
        res: Response,
    ): Promise<Response> {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ errors: errors.array() });
        }

        // Create a new  instance of the task
        const newTask = new Task();

        // Add the required properties to the Task object
        newTask.title = req.body.title;
        newTask.date = req.body.date;
        newTask.description = req.body.description;
        newTask.priority = req.body.priority;
        newTask.status = req.body.status;

        // Add the new task to the database
        let createdTask: Task;

        try {
            createdTask =
                await AppDataSource.getRepository(
                    Task,
                ).save(newTask);

            // Convert the task instance to an object
            createdTask = instanceToPlain(
                createdTask,
            ) as Task;

            return res.json(createdTask).status(201);
        } catch (errors) {
            return res
                .json({ error: 'Internal Server Error ' })
                .status(500);
        }
    }

    public async update(
        req: Request,
        res: Response,
    ): Promise<Response> {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ errors: errors.array() });
        }

        // try to find if the task exists
        const { id, status } = req.body;
        try {
            const task = await AppDataSource.getRepository(
                Task,
            ).findOne({ where: { id } });

            // Return 400 if task is null
            if (!task) {
                return res.status(404).json({
                    error: 'The task with given ID does not exist.',
                });
            }

            // Update the task
            let updatedTask = await AppDataSource.getRepository(
                Task,
            ).update(id, plainToInstance(Task, { status }));

            // Convert the updatedTask instance to an object and save
            updatedTask = instanceToPlain(updatedTask) as UpdateResult

            return res.json(updatedTask).status(201)
        } catch (error) {
            return res
                .json({ error: 'Internal Server Error ' })
                .status(500);
        }
    }
}

export const taskController = new TasksController();
