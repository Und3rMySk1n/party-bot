import { DbService } from '../db-service/db-service';

export interface DrinkData {
    id: string;
    name: string;
}

export class DrinksService {
    private dbService;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public getDrinks(gameId: string): Promise<string[]> {
        return this.dbService.getDrinks(gameId);
    }

    public getDrinksWithIds(gameId: string): Promise<DrinkData[]> {
        return this.dbService.getDrinksWithIds(gameId).then(data => data.map(drinkData => ({
            id: drinkData[0],
            name: drinkData[1],
        })));
    }
    
    public addDrink(gameId: string, drinkName: string): Promise<void> {
        const drinkId = `${gameId}-${Date.now()}`;
        return this.dbService.addDrink(gameId, drinkId, drinkName);
    }

    public clearDrinksList(gameId: string): Promise<void> {
        return this.dbService.clearDrinksList(gameId);
    }
}